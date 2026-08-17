import { useCallback, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import MapView, { PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Plus, LocateFixed, X } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { useLiveReports } from '@/hooks/useLiveReports';
import { ReportPin } from '@/components/ReportPin';
import { CategoryFilterBar } from '@/components/CategoryFilterBar';
import { ReportDetailSheet } from '@/components/ReportDetailSheet';
import { NewReportSheet } from '@/components/NewReportSheet';
import { colors, radius, spacing, type, shadow } from '@/constants/theme';
import type { Report } from '@/types/database';

const DEFAULT_REGION: Region = {
  latitude: -29.8587,
  longitude: 31.0218,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05
};

export default function MapScreen() {
  const { user } = useAuth();
  const { categories } = useCategories();
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[] | null>(null);
  const { reports, onRegionChange, refetch } = useLiveReports({
    categoryFilter: selectedCategoryIds
  });

  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDroppingPin, setIsDroppingPin] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showNewReportForm, setShowNewReportForm] = useState(false);

  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));

  const handleRegionChangeComplete = useCallback(
    (newRegion: Region) => {
      setRegion(newRegion);
      onRegionChange(newRegion);
    },
    [onRegionChange]
  );

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) => {
      if (!prev) return [id];
      if (prev.includes(id)) {
        const next = prev.filter((c) => c !== id);
        return next.length ? next : null;
      }
      return [...prev, id];
    });
  }

  async function handleLocateMe() {
    setIsLocating(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const position = await Location.getCurrentPositionAsync({});
      const nextRegion: Region = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02
      };
      mapRef.current?.animateToRegion(nextRegion, 600);
    }
    setIsLocating(false);
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={DEFAULT_REGION}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {reports.map((report) => (
          <ReportPin
            key={report.id}
            report={report}
            category={categoryById[report.category_id]}
            onPress={setSelectedReport}
          />
        ))}
      </MapView>

      {/* Center crosshair shown only while placing a new pin */}
      {isDroppingPin && (
        <View pointerEvents="none" style={styles.crosshairWrap}>
          <View style={styles.crosshairDot} />
          <View style={styles.crosshairRing} />
        </View>
      )}

      <SafeAreaView style={styles.topOverlay} edges={['top']}>
        <View style={styles.filterBarWrap}>
          <CategoryFilterBar
            categories={categories}
            selectedIds={selectedCategoryIds}
            onToggle={toggleCategory}
            onClear={() => setSelectedCategoryIds(null)}
          />
        </View>
      </SafeAreaView>

      <SafeAreaView style={styles.bottomOverlay} edges={['bottom']} pointerEvents="box-none">
        {isDroppingPin ? (
          <View style={styles.dropConfirmRow}>
            <Pressable
              style={[styles.roundButton, styles.roundButtonGhost]}
              onPress={() => setIsDroppingPin(false)}
            >
              <X color={colors.ink} size={20} />
            </Pressable>
            <Pressable
              style={styles.confirmDropButton}
              onPress={() => {
                setIsDroppingPin(false);
                setShowNewReportForm(true);
              }}
            >
              <Text style={styles.confirmDropText}>Report issue here</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.actionsRow}>
            <Pressable
              style={[styles.roundButton, styles.roundButtonLight]}
              onPress={handleLocateMe}
              disabled={isLocating}
            >
              {isLocating ? (
                <ActivityIndicator color={colors.ink} size="small" />
              ) : (
                <LocateFixed color={colors.ink} size={20} />
              )}
            </Pressable>
            <Pressable
              style={styles.fab}
              onPress={() => setIsDroppingPin(true)}
            >
              <Plus color={colors.ink} size={26} strokeWidth={2.6} />
            </Pressable>
          </View>
        )}
      </SafeAreaView>

      <ReportDetailSheet
        report={selectedReport}
        category={selectedReport ? categoryById[selectedReport.category_id] : undefined}
        visible={selectedReport !== null}
        currentUserId={user?.id}
        onClose={() => setSelectedReport(null)}
      />

      <NewReportSheet
        visible={showNewReportForm}
        categories={categories}
        coordinate={{ latitude: region.latitude, longitude: region.longitude }}
        onClose={() => setShowNewReportForm(false)}
        onSubmitted={() => {
          setShowNewReportForm(false);
          refetch();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  topOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  filterBarWrap: { marginTop: spacing.xs },
  bottomOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md
  },
  roundButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card
  },
  roundButtonLight: { backgroundColor: colors.white },
  roundButtonGhost: { backgroundColor: colors.white },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card
  },
  crosshairWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  crosshairRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.amber,
    backgroundColor: 'rgba(232, 162, 61, 0.15)'
  },
  crosshairDot: {
    position: 'absolute',
    bottom: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.amberDeep
  },
  dropConfirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md
  },
  confirmDropButton: {
    flex: 1,
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    ...shadow.card
  },
  confirmDropText: { color: colors.white, fontWeight: '700', fontSize: type.sizes.md }
});
