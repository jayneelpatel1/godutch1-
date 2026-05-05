import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { useEffect } from 'react';

import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { SplitType, ExpenseSplit } from '@/types/expense';
import { Spacing } from '@/constants/theme';

interface SplitSelectorProps {
  type: SplitType;
  onTypeChange: (type: SplitType) => void;
  amount: number;
  members: { userId: string; name: string }[];
  splits: ExpenseSplit[];
  onSplitsChange: (splits: ExpenseSplit[]) => void;
}

export default function SplitSelector({ type, onTypeChange, amount, members, splits, onSplitsChange }: SplitSelectorProps) {
  const theme = useTheme();

  const splitTypes: { id: SplitType; label: string }[] = [
    { id: 'equal', label: 'Equal' },
    { id: 'exact', label: 'Exact' },
    { id: 'percentage', label: 'Percent' },
    { id: 'ratio', label: 'Ratio' },
  ];

  // Initialize splits when members change or amount changes for equal split
  useEffect(() => {
    if (members.length > 0 && amount > 0) {
      if (type === 'equal') {
        const perPerson = Math.round((amount / members.length) * 100) / 100;
        onSplitsChange(members.map((m) => ({ userId: m.userId, owedAmount: perPerson })));
      } else if (type === 'percentage') {
        const defaultPercent = Math.round((100 / members.length) * 100) / 100;
        const owedAmount = Math.round((amount * defaultPercent) / 100 * 100) / 100;
        onSplitsChange(members.map((m) => ({ userId: m.userId, owedAmount, percentage: defaultPercent })));
      } else if (type === 'ratio') {
        const perPerson = Math.round((amount / members.length) * 100) / 100;
        onSplitsChange(members.map((m) => ({ userId: m.userId, owedAmount: perPerson, ratio: 1 })));
      } else {
        onSplitsChange(members.map((m) => ({ userId: m.userId, owedAmount: 0 })));
      }
    }
  }, [members.length, amount]);

  const handleTypeChange = (newType: SplitType) => {
    onTypeChange(newType);
    if (members.length === 0) return;

    if (newType === 'equal') {
      const perPerson = Math.round((amount / members.length) * 100) / 100;
      onSplitsChange(members.map((m) => ({ userId: m.userId, owedAmount: perPerson })));
    } else if (newType === 'percentage') {
      const defaultPercent = Math.round((100 / members.length) * 100) / 100;
      const owedAmount = Math.round((amount * defaultPercent) / 100 * 100) / 100;
      onSplitsChange(members.map((m) => ({ userId: m.userId, owedAmount, percentage: defaultPercent })));
    } else if (newType === 'ratio') {
      const perPerson = Math.round((amount / members.length) * 100) / 100;
      onSplitsChange(members.map((m) => ({ userId: m.userId, owedAmount: perPerson, ratio: 1 })));
    } else {
      onSplitsChange(members.map((m) => ({ userId: m.userId, owedAmount: 0 })));
    }
  };

  const updateSplitValue = (userId: string, value: number) => {
    const newSplits = splits.map((s) => (s.userId === userId ? { ...s, owedAmount: value } : s));
    onSplitsChange(newSplits);
  };

  const updateSplitPercentage = (userId: string, percentage: number) => {
    const others = splits.filter((s) => s.userId !== userId);
    const othersTotalPercent = others.reduce((sum, s) => sum + (s.percentage || 0), 0);
    const remainingPercent = 100 - percentage;

    let newSplits: ExpenseSplit[];
    if (othersTotalPercent > 0 && remainingPercent > 0) {
      const scaleFactor = remainingPercent / othersTotalPercent;
      newSplits = splits.map((s) => {
        if (s.userId === userId) {
          const owedAmount = Math.round((amount * percentage) / 100 * 100) / 100;
          return { userId, owedAmount, percentage };
        }
        const newPercent = Math.round((s.percentage || 0) * scaleFactor * 100) / 100;
        const owedAmount = Math.round((amount * newPercent) / 100 * 100) / 100;
        return { ...s, percentage: newPercent, owedAmount };
      });
    } else {
      const othersCount = others.length;
      const othersPercent = othersCount > 0 ? Math.round((remainingPercent / othersCount) * 100) / 100 : 0;
      newSplits = splits.map((s) => {
        if (s.userId === userId) {
          const owedAmount = Math.round((amount * percentage) / 100 * 100) / 100;
          return { userId, owedAmount, percentage };
        }
        const owedAmount = Math.round((amount * othersPercent) / 100 * 100) / 100;
        return { ...s, percentage: othersPercent, owedAmount };
      });
    }
    onSplitsChange(newSplits);
  };

  const updateSplitRatio = (userId: string, ratio: number) => {
    const updatedSplits = splits.map((s) =>
      s.userId === userId ? { ...s, ratio } : s
    );
    const totalRatio = updatedSplits.reduce((sum, s) => sum + (s.ratio || 0), 0);

    if (totalRatio === 0) return;

    const newSplits = updatedSplits.map((s) => {
      const owedAmount = Math.round((amount * (s.ratio || 0)) / totalRatio * 100) / 100;
      return { ...s, owedAmount };
    });
    onSplitsChange(newSplits);
  };

  const getMemberName = (userId: string): string => {
    const member = members.find((m) => m.userId === userId);
    return member?.name || userId;
  };

  const totalOwed = splits.reduce((sum, s) => sum + s.owedAmount, 0);
  const totalPercent = splits.reduce((sum, s) => sum + (s.percentage || 0), 0);
  const totalRatio = splits.reduce((sum, s) => sum + (s.ratio || 0), 0);
  const isAmountMismatch = Math.abs(totalOwed - amount) > 0.01;

  return (
    <View style={styles.container}>
      <View style={styles.typeRow}>
        {splitTypes.map((t) => (
          <Pressable
            key={t.id}
            style={[
              styles.typeButton,
              { backgroundColor: theme.backgroundElement },
              type === t.id && { backgroundColor: theme.primary },
            ]}
            onPress={() => handleTypeChange(t.id)}>
            <ThemedText style={[
              styles.typeText,
              type === t.id && { color: '#FFFFFF' },
            ]}>
              {t.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <View style={styles.memberList}>
        {members.map((member) => {
          const split = splits.find((s) => s.userId === member.userId);
          return (
            <View key={member.userId} style={styles.memberRow}>
              <ThemedText style={styles.memberName}>{getMemberName(member.userId)}</ThemedText>
              {type === 'exact' && (
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
                  value={split?.owedAmount?.toString() || ''}
                  onChangeText={(val) => updateSplitValue(member.userId, parseFloat(val) || 0)}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={theme.textSecondary}
                />
              )}
              {type === 'percentage' && (
                <View style={styles.percentRow}>
                  <TextInput
                    style={[styles.percentInput, { backgroundColor: theme.backgroundElement, color: theme.text }]}
                    value={split?.percentage?.toString() || ''}
                    onChangeText={(val) => updateSplitPercentage(member.userId, parseFloat(val) || 0)}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={theme.textSecondary}
                  />
                  <ThemedText style={[styles.percentAmount, { color: theme.textSecondary }]}>₹{split?.owedAmount?.toFixed(2) || '0.00'}</ThemedText>
                </View>
              )}
              {type === 'ratio' && (
                <View style={styles.percentRow}>
                  <TextInput
                    style={[styles.percentInput, { backgroundColor: theme.backgroundElement, color: theme.text }]}
                    value={split?.ratio?.toString() || ''}
                    onChangeText={(val) => updateSplitRatio(member.userId, parseFloat(val) || 0)}
                    keyboardType="decimal-pad"
                    placeholder="1"
                    placeholderTextColor={theme.textSecondary}
                  />
                  <ThemedText style={[styles.percentAmount, { color: theme.textSecondary }]}>₹{split?.owedAmount?.toFixed(2) || '0.00'}</ThemedText>
                </View>
              )}
              {type === 'equal' && (
                <ThemedText style={[styles.equalAmount, { color: theme.primary }]}>
                   ₹{split?.owedAmount?.toFixed(2) || '0.00'}
                </ThemedText>
              )}
            </View>
          );
        })}
      </View>

      {isAmountMismatch && type === 'exact' && (
        <ThemedText style={[styles.warningText, { color: theme.danger }]}>
          Total: ₹{totalOwed.toFixed(2)} / ₹{amount.toFixed(2)}
        </ThemedText>
      )}

      {type === 'percentage' && Math.abs(totalPercent - 100) > 0.01 && (
        <ThemedText style={[styles.warningText, { color: theme.danger }]}>
          Total: {totalPercent.toFixed(1)}% / 100%
        </ThemedText>
      )}

      {type === 'ratio' && totalRatio === 0 && (
        <ThemedText style={[styles.warningText, { color: theme.danger }]}>
          Total ratio must be greater than 0
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  memberList: {
    gap: Spacing.two,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.one,
  },
  memberName: {
    flex: 1,
    fontSize: 14,
  },
  input: {
    borderRadius: 8,
    padding: Spacing.one,
    paddingHorizontal: Spacing.two,
    fontSize: 14,
    minWidth: 80,
    textAlign: 'right',
  },
  percentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  percentInput: {
    borderRadius: 8,
    padding: Spacing.one,
    paddingHorizontal: Spacing.two,
    fontSize: 14,
    minWidth: 50,
    textAlign: 'right',
    maxWidth: 60,
  },
  percentAmount: {
    fontSize: 13,
    fontWeight: '500',
    minWidth: 50,
    textAlign: 'right',
  },
  equalAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 12,
    marginTop: Spacing.one,
    fontWeight: '500',
  },
});
