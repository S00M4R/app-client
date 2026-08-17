import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import * as Icons from 'lucide-react-native';
import { colors, radius, spacing, type, shadow } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import type { ReportCategory } from '@/types/database';

interface NewReportSheetProps {
  visible: boolean;
  categories: ReportCategory[];
  coordinate: { latitude: number; longitude: number } | null;
  onClose: () => void;
  onSubmitted: () => void;
}

function resolveIcon(name: string) {
  const pascal = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return (Icons as unknown as Record<string, React.ComponentType<any>>)[pascal] ?? Icons.MapPin;
}

const SEVERITY_LABELS = ['', 'Minor', 'Low', 'Moderate', 'Serious', 'Critical'];

export function NewReportSheet({
  visible,
  categories,
  coordinate,
  onClose,
  onSubmitted
}: NewReportSheetProps) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState(2);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function reset() {
    setCategoryId(null);
    setTitle('');
    setDescription('');
    setSeverity(2);
    setIsAnonymous(false);
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (!coordinate) {
      setError('No location selected.');
      return;
    }
    if (!categoryId) {
      setError('Choose a category.');
      return;
    }
    if (title.trim().length < 3) {
      setError('Give it a short title (3+ characters).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be signed in.');
      setIsSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from('reports').insert({
      reporter_id: user.id,
      category_id: categoryId,
      title: title.trim(),
      description: description.trim() || null,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      severity,
      is_anonymous: isAnonymous
    });

    setIsSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    reset();
    onSubmitted();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouchable} onPress={handleClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView edges={['bottom']} style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <Text style={styles.heading}>Report an issue</Text>
              <Pressable onPress={handleClose} hitSlop={12}>
                <X color={colors.textSecondary} size={22} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryGrid}>
                {categories.map((cat) => {
                  const Icon = resolveIcon(cat.icon);
                  const active = categoryId === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      style={[
                        styles.categoryTile,
                        active && { backgroundColor: cat.color, borderColor: cat.color }
                      ]}
                      onPress={() => {
                        setCategoryId(cat.id);
                        setSeverity(cat.severity_default);
                      }}
                    >
                      <Icon color={active ? colors.white : cat.color} size={18} />
                      <Text
                        style={[styles.categoryTileText, active && { color: colors.white }]}
                        numberOfLines={1}
                      >
                        {cat.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.label}>What's going on?</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Water main burst on Oak St"
                placeholderTextColor={colors.textSecondary}
                maxLength={120}
              />

              <Text style={styles.label}>Details (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Anything responders should know"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                maxLength={2000}
              />

              <Text style={styles.label}>Severity</Text>
              <View style={styles.severityRow}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <Pressable
                    key={level}
                    style={[styles.severityDot, severity >= level && styles.severityDotActive]}
                    onPress={() => setSeverity(level)}
                  />
                ))}
                <Text style={styles.severityLabel}>{SEVERITY_LABELS[severity]}</Text>
              </View>

              <Pressable
                style={styles.anonRow}
                onPress={() => setIsAnonymous((v) => !v)}
              >
                <View style={[styles.checkbox, isAnonymous && styles.checkboxActive]} />
                <Text style={styles.anonText}>Post anonymously</Text>
              </Pressable>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable
                style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Dropping pin…' : 'Drop pin'}
                </Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.scrim, justifyContent: 'flex-end' },
  backdropTouchable: { flex: 1 },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.sheet
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginBottom: spacing.md
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  heading: { fontSize: type.sizes.xl, fontWeight: '800', color: colors.textPrimary },
  label: {
    fontSize: type.sizes.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    marginTop: spacing.md
  },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  categoryTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  categoryTileText: { fontSize: type.sizes.sm, fontWeight: '600', color: colors.textPrimary },
  input: {
    backgroundColor: colors.paperMuted,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: type.sizes.md,
    color: colors.textPrimary
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  severityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
  severityDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white
  },
  severityDotActive: { backgroundColor: colors.amber, borderColor: colors.amberDeep },
  severityLabel: {
    marginLeft: spacing.xs,
    fontSize: type.sizes.sm,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  anonRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm / 2,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white
  },
  checkboxActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  anonText: { fontSize: type.sizes.sm, color: colors.textPrimary },
  errorText: { color: colors.danger, fontSize: type.sizes.sm, marginTop: spacing.sm },
  submitButton: {
    backgroundColor: colors.amber,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg
  },
  submitButtonText: { color: colors.ink, fontWeight: '700', fontSize: type.sizes.md }
});
