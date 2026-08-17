import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { formatDistanceToNow } from 'date-fns';
import * as Icons from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useCategories } from '@/hooks/useCategories';
import { colors, radius, spacing, type } from '@/constants/theme';
import type { ReportNearby } from '@/types/database';

function resolveIcon(name: string) {
  const pascal = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return (Icons as unknown as Record<string, React.ComponentType<any>>)[pascal] ?? Icons.MapPin;
}

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export default function ReportsListScreen() {
  const { categories } = useCategories();
  const [reports, setReports] = useState<ReportNearby[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));

  const load = useCallback(async () => {
    setErrorMsg(null);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Location permission is needed to show reports near you.');
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }
    const position = await Location.getCurrentPositionAsync({});
    const { data, error } = await supabase.rpc('reports_nearby', {
      center_lat: position.coords.latitude,
      center_lng: position.coords.longitude,
      radius_meters: 5000,
      category_filter: null
    });
    if (error) {
      setErrorMsg(error.message);
    } else {
      setReports(data ?? []);
    }
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby</Text>
        <Text style={styles.headerSubtitle}>Within 5 km, closest first</Text>
      </View>

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.ink} />
        </View>
      ) : errorMsg ? (
        <View style={styles.centerFill}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                load();
              }}
              tintColor={colors.ink}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerFill}>
              <Text style={styles.emptyText}>No reports nearby. That's a good thing.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const category = categoryById[item.category_id];
            const Icon = resolveIcon(category?.icon ?? 'map-pin');
            return (
              <View style={styles.card}>
                <View style={[styles.iconBadge, { backgroundColor: category?.color ?? colors.amber }]}>
                  <Icon color={colors.white} size={18} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {category?.label ?? 'Report'} · {formatDistance(item.distance_meters)} ·{' '}
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  headerTitle: { fontSize: type.sizes.xxl, fontWeight: '800', color: colors.textPrimary },
  headerSubtitle: { fontSize: type.sizes.sm, color: colors.textSecondary, marginTop: 2 },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.danger, textAlign: 'center' },
  emptyText: { color: colors.textSecondary, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.sm
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: type.sizes.md, fontWeight: '700', color: colors.textPrimary },
  cardMeta: { fontSize: type.sizes.xs, color: colors.textSecondary, marginTop: 2 }
});
