import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ThumbsUp, Clock, MapPin } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { colors, radius, spacing, type, shadow } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import type { Report, ReportCategory } from '@/types/database';

interface ReportDetailSheetProps {
  report: Report | null;
  category: ReportCategory | undefined;
  visible: boolean;
  currentUserId: string | undefined;
  onClose: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  acknowledged: 'Acknowledged',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
  rejected: 'Rejected'
};

export function ReportDetailSheet({
  report,
  category,
  visible,
  currentUserId,
  onClose
}: ReportDetailSheetProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(report?.upvote_count ?? 0);
  const [isVoting, setIsVoting] = useState(false);

  if (!report) return null;

  async function handleVote() {
    if (!report || isVoting) return;
    setIsVoting(true);
    const { data, error } = await supabase.rpc('toggle_report_vote', {
      p_report_id: report.id
    });
    if (!error) {
      setHasVoted(Boolean(data));
      setVoteCount((c) => (data ? c + 1 : Math.max(c - 1, 0)));
    }
    setIsVoting(false);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouchable} onPress={onClose} />
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <View
              style={[styles.categoryBadge, { backgroundColor: category?.color ?? colors.amber }]}
            >
              <Text style={styles.categoryBadgeText}>{category?.label ?? 'Report'}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={12}>
              <X color={colors.textSecondary} size={22} />
            </Pressable>
          </View>

          <Text style={styles.title}>{report.title}</Text>

          <View style={styles.metaRow}>
            <Clock color={colors.textSecondary} size={14} />
            <Text style={styles.metaText}>
              {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
            </Text>
            <View style={styles.metaDivider} />
            <Text style={styles.metaText}>{STATUS_LABELS[report.status] ?? report.status}</Text>
          </View>

          {report.address_label && (
            <View style={styles.metaRow}>
              <MapPin color={colors.textSecondary} size={14} />
              <Text style={styles.metaText}>{report.address_label}</Text>
            </View>
          )}

          {report.description ? (
            <Text style={styles.description}>{report.description}</Text>
          ) : null}

          <Pressable
            style={[styles.voteButton, hasVoted && styles.voteButtonActive]}
            onPress={handleVote}
            disabled={isVoting}
          >
            <ThumbsUp
              color={hasVoted ? colors.white : colors.ink}
              size={16}
              fill={hasVoted ? colors.white : 'transparent'}
            />
            <Text style={[styles.voteButtonText, hasVoted && styles.voteButtonTextActive]}>
              {hasVoted ? 'Confirmed' : 'Still happening'} · {voteCount}
            </Text>
          </Pressable>
        </SafeAreaView>
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs
  },
  categoryBadgeText: { color: colors.white, fontWeight: '700', fontSize: type.sizes.xs },
  title: {
    fontSize: type.sizes.xl,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.sm
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginTop: spacing.xs
  },
  metaText: { fontSize: type.sizes.sm, color: colors.textSecondary },
  metaDivider: { width: 1, height: 12, backgroundColor: colors.line, marginHorizontal: spacing.xxs },
  description: {
    fontSize: type.sizes.md,
    color: colors.textPrimary,
    marginTop: spacing.md,
    lineHeight: 22
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    marginTop: spacing.lg
  },
  voteButtonActive: { backgroundColor: colors.ink },
  voteButtonText: { fontWeight: '700', color: colors.ink, fontSize: type.sizes.sm },
  voteButtonTextActive: { color: colors.white }
});
