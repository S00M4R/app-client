import { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import * as Icons from 'lucide-react-native';
import { colors } from '@/constants/theme';
import type { Report, ReportCategory } from '@/types/database';

interface ReportPinProps {
  report: Report;
  category: ReportCategory | undefined;
  onPress: (report: Report) => void;
}

const FRESH_WINDOW_MS = 5 * 60 * 1000; // pins younger than this get the pulse

// lucide-react-native exports icons in PascalCase; category.icon is kebab-case.
function resolveIcon(name: string) {
  const pascal = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<any>>)[pascal];
  return IconComponent ?? Icons.MapPin;
}

export function ReportPin({ report, category, onPress }: ReportPinProps) {
  const pulse = useRef(new Animated.Value(0)).current;
  const isFresh = Date.now() - new Date(report.created_at).getTime() < FRESH_WINDOW_MS;
  const pinColor = category?.color ?? colors.amber;
  const Icon = resolveIcon(category?.icon ?? 'map-pin');

  useEffect(() => {
    if (!isFresh) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isFresh, pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <Marker
      coordinate={{ latitude: report.latitude, longitude: report.longitude }}
      onPress={() => onPress(report)}
      tracksViewChanges={false}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View style={styles.wrap}>
        {isFresh && (
          <Animated.View
            style={[
              styles.pulseRing,
              { borderColor: pinColor, transform: [{ scale }], opacity }
            ]}
          />
        )}
        <View style={[styles.pin, { backgroundColor: pinColor }]}>
          <Icon color={colors.white} size={16} strokeWidth={2.4} />
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', width: 40, height: 40 },
  pulseRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2
  },
  pin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4
  }
});
