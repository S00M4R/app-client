import { ScrollView, Pressable, Text, StyleSheet, View } from 'react-native';
import { colors, radius, spacing, type } from '@/constants/theme';
import type { ReportCategory } from '@/types/database';

interface CategoryFilterBarProps {
  categories: ReportCategory[];
  selectedIds: string[] | null; // null = all selected
  onToggle: (id: string) => void;
  onClear: () => void;
}

export function CategoryFilterBar({
  categories,
  selectedIds,
  onToggle,
  onClear
}: CategoryFilterBarProps) {
  const allSelected = selectedIds === null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <Pressable
        style={[styles.chip, allSelected && styles.chipActiveNeutral]}
        onPress={onClear}
      >
        <Text style={[styles.chipText, allSelected && styles.chipTextActive]}>All</Text>
      </Pressable>
      {categories.map((cat) => {
        const active = selectedIds?.includes(cat.id) ?? false;
        return (
          <Pressable
            key={cat.id}
            style={[styles.chip, active && { backgroundColor: cat.color, borderColor: cat.color }]}
            onPress={() => onToggle(cat.id)}
          >
            <View style={[styles.dot, { backgroundColor: active ? colors.white : cat.color }]} />
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing.md, gap: spacing.xs, paddingVertical: spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
    marginRight: spacing.xs
  },
  chipActiveNeutral: { backgroundColor: colors.ink, borderColor: colors.ink },
  dot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontSize: type.sizes.sm, fontWeight: '600', color: colors.textPrimary },
  chipTextActive: { color: colors.white }
});
