import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from './themed-text';
import type { Activity } from '@/types/activity';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ActivityItemProps {
  activity: Activity;
  onPress?: () => void;
}

const typeIcons: Record<string, { name: string; colors: [string, string] }> = {
  expense_created: { name: 'receipt-outline', colors: ['#FEF3E2', '#FDE8CC'] },
  expense_updated: { name: 'create-outline', colors: ['#FFF3E0', '#FFE8CC'] },
  expense_deleted: { name: 'trash-outline', colors: ['#FFEBEE', '#FFCDD2'] },
  group_created: { name: 'people-outline', colors: ['#E3F2FD', '#BBDEFB'] },
  member_added: { name: 'person-add-outline', colors: ['#F3E5F5', '#E1BEE7'] },
};

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ActivityItem({ activity, onPress }: ActivityItemProps) {
  const theme = useTheme();
  const config = typeIcons[activity.type] || typeIcons.expense_created;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, { backgroundColor: theme.backgroundElement }, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
      onPress={onPress}>
      <View style={styles.iconWrap}>
        <LinearGradient
          colors={config.colors}
          style={styles.iconGradient}>
          <Ionicons name={config.name as any} size={18} color={theme.primary} />
        </LinearGradient>
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <ThemedText type="subtitle" style={styles.title}>
            {activity.title}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.time}>
            {getRelativeTime(activity.createdAt)}
          </ThemedText>
        </View>
        {activity.description && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.description}>
            {activity.description}
          </ThemedText>
        )}
        {activity.metadata?.groupName && (
          <View style={styles.groupBadge}>
            <Ionicons name="folder-outline" size={12} color={theme.primary} />
            <ThemedText type="small" style={[styles.groupName, { color: theme.primary }]}>
              {activity.metadata.groupName as string}
            </ThemedText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: BorderRadius,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  iconWrap: {
    marginRight: Spacing.two,
    marginTop: 2,
  },
  iconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    marginRight: Spacing.two,
  },
  time: {
    flexShrink: 0,
  },
  description: {
    marginTop: 2,
  },
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.one,
    gap: 4,
  },
  groupName: {
    fontWeight: '500',
  },
});
