/**
 * @component ActivityItem
 * @description Displays a single activity feed item with a date column,
 *              gradient icon based on activity type, and description text.
 *
 * @used-in ActivityScreen
 *
 * @props
 *   - activity: Activity      — The activity data to display
 *   - onPress?: () => void    — Tap handler for the item
 *
 * @platform Android ✅ | iOS ✅ | Web ✅
 */

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
  expense_added: { name: 'receipt-outline', colors: ['#FEF3E2', '#FDE8CC'] },
  expense_edited: { name: 'create-outline', colors: ['#FFF3E0', '#FFE8CC'] },
  settlement: { name: 'swap-horizontal-outline', colors: ['#E8F5E9', '#C8E6C9'] },
  member_joined: { name: 'person-add-outline', colors: ['#F3E5F5', '#E1BEE7'] },
  member_left: { name: 'person-remove-outline', colors: ['#FFEBEE', '#FFCDD2'] },
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
  const config = typeIcons[activity.type] || typeIcons.expense_added;
  const dateDisplay = getDateDisplay(activity.createdAt);

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
        <ThemedText style={styles.description} numberOfLines={2}>
          {activity.description}
        </ThemedText>
      </View>
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
  description: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
