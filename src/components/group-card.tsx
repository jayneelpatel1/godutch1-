import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import type { GroupWithMembers } from '@/types/group';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

interface GroupCardProps {
  group: GroupWithMembers;
  onPress?: () => void;
}

export default function GroupCard({ group, onPress }: GroupCardProps) {
  const members = group.memberCount ? Array(group.memberCount).fill(0).map((_, i) => `user${i + 1}`) : [];
  const displayMembers = members.slice(0, 3);
  const overflowCount = Math.max(0, members.length - 3);

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.topRow}>
        <View style={styles.avatarStack}>
          {displayMembers.map((userId, index) => (
            <View key={userId} style={[styles.memberAvatar, { marginLeft: index > 0 ? -Spacing.one : 0 }]}>
              <ThemedText style={styles.memberAvatarText}>
                {userId.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          ))}
          {overflowCount > 0 && (
            <View style={[styles.memberAvatar, styles.overflowAvatar, { marginLeft: -Spacing.one }]}>
              <ThemedText style={styles.memberAvatarText}>+{overflowCount}</ThemedText>
            </View>
          )}
        </View>
        <View style={[styles.balanceBadge, styles.settledBadge]}>
          <ThemedText style={[styles.balanceText, { color: Colors.light.textSecondary }]}>
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
    backgroundColor: Colors.light.backgroundElement,
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
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.light.backgroundElement,
  },
  memberAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  overflowAvatar: {
    backgroundColor: Colors.light.backgroundSelected,
  },
  balanceBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 8,
  },
  positiveBadge: {
    backgroundColor: '#DCFCE7',
  },
  negativeBadge: {
    backgroundColor: '#FEE2E2',
  },
  settledBadge: {
    backgroundColor: Colors.light.backgroundSelected,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '700',
  },
  info: {
    marginTop: Spacing.one,
  },
  groupName: {
    marginBottom: Spacing.half,
  },
});