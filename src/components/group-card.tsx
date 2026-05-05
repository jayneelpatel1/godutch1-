import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import type { GroupWithMembers } from '@/types/group';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';

interface GroupCardProps {
  group: GroupWithMembers;
  onPress?: () => void;
}

export default function GroupCard({ group, onPress }: GroupCardProps) {
  const theme = useTheme();
  const members = group.memberCount ? Array(group.memberCount).fill(0).map((_, i) => `user${i + 1}`) : [];
  const displayMembers = members.slice(0, 3);
  const overflowCount = Math.max(0, members.length - 3);

  return (
    <Pressable
      style={({ pressed }) => [styles.container, { backgroundColor: theme.backgroundElement }, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.topRow}>
        <View style={styles.avatarStack}>
          {displayMembers.map((userId, index) => (
            <View key={userId} style={[styles.memberAvatar, { marginLeft: index > 0 ? -Spacing.one : 0, backgroundColor: theme.primary }]}>
              <ThemedText style={[styles.memberAvatarText, { color: '#FFFFFF' }]}>
                {userId.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          ))}
          {overflowCount > 0 && (
            <View style={[styles.memberAvatar, styles.overflowAvatar, { backgroundColor: theme.backgroundSelected, marginLeft: -Spacing.one }]}>
              <ThemedText style={styles.memberAvatarText}>+{overflowCount}</ThemedText>
            </View>
          )}
        </View>
        <View style={[styles.balanceBadge, styles.settledBadge]}>
          <ThemedText style={[styles.balanceText, { color: theme.textSecondary }]}>
            settled up
          </ThemedText>
        </View>
      </View>
      <View style={styles.info}>
        <ThemedText type="subtitle" style={styles.groupName}>{group.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {group.memberCount || 0} members · 0 expenses
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  memberAvatarText: {
    fontSize: 12,
    fontWeight: '600',
  },
  overflowAvatar: {},
  balanceBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 8,
  },
  settledBadge: {},
  balanceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  info: {},
  groupName: {
    marginBottom: Spacing.half,
  },
});
