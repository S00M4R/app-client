import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ReportCategory } from '@/types/database';

export function useCategories() {
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      const { data, error: fetchError } = await supabase
        .from('report_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!isMounted) return;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setCategories(data ?? []);
      }
      setIsLoading(false);
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return { categories, isLoading, error };
}
