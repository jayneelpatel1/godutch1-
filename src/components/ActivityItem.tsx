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

function getDateDisplay(dateString: string): { top: string; bottom: string } {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (target.getTime() === today.getTime()) return { top: 'Today', bottom: '' };
  return {
    top: date.getDate().toString(),
    bottom: date.toLocaleDateString('en-US', { month: 'short' }),
  };
}

export default function ActivityItem({ activity, onPress }: ActivityItemProps) {
  const theme = useTheme();
  const config = typeIcons[activity.type] || typeIcons.expense_created;
  const dateDisplay = getDateDisplay(activity.createdAt);

  const rawAmount = activity.metadata?.amount;
  const amount = typeof rawAmount === 'number' ? rawAmount : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, { backgroundColor: theme.backgroundElement }, pressed && { opacity: 0.85 }]}
      onPress={onPress}>

      <View style={styles.dateColumn}>
        <ThemedText style={styles.dateTop}>{dateDisplay.top}</ThemedText>
        {dateDisplay.bottom ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.dateBottom}>{dateDisplay.bottom}</ThemedText>
        ) : null}
      </View>

      <View style={styles.iconWrap}>
        <LinearGradient colors={config.colors} style={styles.iconGradient}>
          <Ionicons name={config.name as any} size={16} color={theme.primary} />
        </LinearGradient>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.title} numberOfLines={1}>
          {activity.title}
        </ThemedText>
        {activity.description ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.description} numberOfLines={1}>
            {activity.description}
          </ThemedText>
        ) : null}
        {activity.metadata?.groupName ? (
          <View style={styles.groupBadge}>
            <Ionicons name="folder-outline" size={10} color={theme.primary} />
            <ThemedText type="small" style={[styles.groupName, { color: theme.primary }]}>
              {activity.metadata.groupName as string}
            </ThemedText>
          </View>
        ) : null}
      </View>

      {amount !== null ? (
        <View style={styles.amountColumn}>
          <ThemedText style={[styles.amountText, { color: theme.primary }]}>
            {'\u20B9'}{amount.toFixed(2)}
          </ThemedText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.one,
  },
  dateColumn: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.two,
  },
  dateTop: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
  },
  dateBottom: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
    marginTop: 1,
  },
  iconWrap: {
    marginRight: Spacing.two,
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
    marginRight: Spacing.two,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  description: {
    marginTop: 1,
  },
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 3,
  },
  groupName: {
    fontWeight: '500',
    fontSize: 11,
  },
  amountColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 70,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
