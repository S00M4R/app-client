import { useCallback, useEffect, useRef, useState } from 'react';
import type { Region } from 'react-native-maps';
import { supabase } from '@/lib/supabase';
import type { Report, ReportStatus } from '@/types/database';

interface UseLiveReportsOptions {
  categoryFilter?: string[] | null;
  statusFilter?: ReportStatus[] | null;
}

/**
 * Loads reports within the current map viewport and keeps them live via
 * Supabase Realtime. Viewport refetch is debounced so panning/zooming
 * doesn't spam the RPC; realtime patches state in place so new pins from
 * other users appear immediately without a refetch.
 */
export function useLiveReports(options: UseLiveReportsOptions = {}) {
  const { categoryFilter = null, statusFilter = null } = options;
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRegionRef = useRef<Region | null>(null);

  const fetchForRegion = useCallback(
    async (region: Region) => {
      const minLat = region.latitude - region.latitudeDelta / 2;
      const maxLat = region.latitude + region.latitudeDelta / 2;
      const minLng = region.longitude - region.longitudeDelta / 2;
      const maxLng = region.longitude + region.longitudeDelta / 2;

      const { data, error: fetchError } = await supabase.rpc('reports_in_bounds', {
        min_lat: minLat,
        min_lng: minLng,
        max_lat: maxLat,
        max_lng: maxLng,
        category_filter: categoryFilter,
        status_filter: statusFilter
      });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setReports((data as Report[]) ?? []);
        setError(null);
      }
      setIsLoading(false);
    },
    [categoryFilter, statusFilter]
  );

  const onRegionChange = useCallback(
    (region: Region) => {
      lastRegionRef.current = region;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchForRegion(region);
      }, 400);
    },
    [fetchForRegion]
  );

  // Realtime subscription: patch local state directly on INSERT/UPDATE/DELETE
  // rather than refetching, so the map updates instantly for live pins.
  useEffect(() => {
    const channel = supabase
      .channel('public:reports')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reports' },
        (payload) => {
          const newReport = payload.new as Report;
          setReports((prev) => {
            if (prev.some((r) => r.id === newReport.id)) return prev;
            // Only add if it's plausibly within the currently loaded viewport;
            // a cheap containment check avoids pins from the other side of
            // the world flying onto a zoomed-in map.
            const region = lastRegionRef.current;
            if (region) {
              const minLat = region.latitude - region.latitudeDelta / 2;
              const maxLat = region.latitude + region.latitudeDelta / 2;
              const minLng = region.longitude - region.longitudeDelta / 2;
              const maxLng = region.longitude + region.longitudeDelta / 2;
              const inView =
                newReport.latitude >= minLat &&
                newReport.latitude <= maxLat &&
                newReport.longitude >= minLng &&
                newReport.longitude <= maxLng;
              if (!inView) return prev;
            }
            if (categoryFilter && !categoryFilter.includes(newReport.category_id)) return prev;
            if (statusFilter && !statusFilter.includes(newReport.status)) return prev;
            return [newReport, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'reports' },
        (payload) => {
          const updated = payload.new as Report;
          setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'reports' },
        (payload) => {
          const deleted = payload.old as Partial<Report>;
          setReports((prev) => prev.filter((r) => r.id !== deleted.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [categoryFilter, statusFilter]);

  return { reports, isLoading, error, onRegionChange, refetch: () => {
    if (lastRegionRef.current) fetchForRegion(lastRegionRef.current);
  } };
}
