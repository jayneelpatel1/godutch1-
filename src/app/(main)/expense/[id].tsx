import { StyleSheet, View, Pressable, ScrollView, ActivityIndicator, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExpense, useDeleteExpense } from '@/hooks/useExpenses';
import { fetchUsersByIds } from '@/services/userService';
import { showToast, Toast } from '@/components/Toast';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const categoryIcons: Record<string, string> = {
  food: 'restaurant-outline',
  rent: 'home-outline',
  petrol: 'car-outline',
  travel: 'airplane-outline',
  shopping: 'bag-outline',
  utilities: 'flash-outline',
  entertainment: 'film-outline',
  other: 'ellipsis-horizontal-outline',
};

interface UserMap {
  [userId: string]: string;
}

export default function ExpenseDetailsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { expense, isLoading: loadingExpense } = useExpense(id as string);
  const deleteExpenseMutation = useDeleteExpense(expense?.groupId || '');

  const [userNames, setUserNames] = useState<UserMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!expense?.splits || !expense?.paidBy) {
      setLoading(false);
      return;
    }

    const userIds = [...new Set([expense.paidBy, ...expense.splits.map((s) => s.userId)])];

    fetchUsersByIds(userIds).then((result) => {
      if (result.users) {
        const names: UserMap = {};
        result.users.forEach((u) => {
          names[u.id] = u.name || u.email?.split('@')[0] || 'Unknown';
        });
        setUserNames(names);
      }
      setLoading(false);
    }).catch((e) => {
      console.error('[expense-detail] Failed to fetch user names:', e);
      setLoading(false);
    });
  }, [expense?.id]);

  const handleEdit = () => {
    router.push(`/expense/${id}/edit`);
  };

  const handleDelete = () => {
    const doDelete = async () => {
      try {
        await deleteExpenseMutation.mutateAsync(id as string);
        showToast('success', 'Expense deleted');
        if (expense?.groupId) {
          router.replace(`/group/${expense.groupId}`);
        } else {
          router.replace('/');
        }
      } catch (error) {
        console.error('[expense-detail] Failed to delete:', error);
        showToast('error', 'Failed to delete expense');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this expense?')) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Delete Expense',
        'Are you sure you want to delete this expense?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: doDelete,
          },
        ]
      );
    }
  };

  if (loadingExpense || loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </Pressable>
            <ThemedText type="title">Expense Details</ThemedText>
          </View>
          <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!expense) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </Pressable>
            <ThemedText type="title">Expense Details</ThemedText>
            <View style={styles.headerActions}>
              <Pressable onPress={handleEdit} style={styles.headerAction}>
                <Ionicons name="pencil-outline" size={22} color={theme.primary} />
              </Pressable>
              <Pressable onPress={handleDelete} style={styles.headerAction}>
                <Ionicons name="trash-outline" size={22} color={theme.danger} />
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </Pressable>
            <ThemedText type="title">Expense Details</ThemedText>
            <View style={styles.headerActions}>
              <Pressable onPress={handleEdit} style={styles.headerAction}>
                <Ionicons name="pencil-outline" size={22} color={theme.primary} />
              </Pressable>
              <Pressable onPress={handleDelete} style={styles.headerAction}>
                <Ionicons name="trash-outline" size={22} color={theme.danger} />
              </Pressable>
            </View>
          </View>

          <View style={styles.content}>
              {/* Amount Card */}
              <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
                <View style={[styles.iconWrap, { backgroundColor: theme.primary + '20' }]}>
                  <Ionicons
                    name={categoryIcons[expense.category] as any || 'ellipsis-horizontal-outline'}
                    size={32}
                    color={theme.primary}
                  />
                </View>
                <ThemedText type="title" style={[styles.amount, { color: theme.text }]}>
                  ₹{expense.amount.toFixed(2)}
                </ThemedText>
                <ThemedText type="subtitle" style={styles.note}>
                  {expense.note || 'No description'}
                </ThemedText>
                <View style={styles.metaRow}>
                  <Ionicons name="pricetag-outline" size={14} color={theme.textSecondary} />
                  <ThemedText type="small" themeColor="textSecondary" style={styles.metaText}>
                    {expense.category}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary"> · </ThemedText>
                  <Ionicons name="swap-horizontal-outline" size={14} color={theme.textSecondary} />
                  <ThemedText type="small" themeColor="textSecondary" style={styles.metaText}>
                    {expense.splitType} split
                  </ThemedText>
                </View>
              </View>

              {/* Split Details Card */}
              <View style={[styles.splitsCard, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="subtitle" style={styles.splitsTitle}>
                  Split Details
                </ThemedText>
                {(expense.splits || []).map((split) => {
                  const name = userNames[split.userId] || split.userId;
                  const isPayer = split.userId === expense.paidBy;
                  return (
                    <View key={split.userId} style={[styles.splitRow, { borderBottomColor: theme.backgroundSelected }]}>
                      <View style={styles.splitUserRow}>
                        <View style={[styles.smallAvatar, { backgroundColor: isPayer ? theme.success : theme.textSecondary }]}>
                          <Ionicons name="person" size={12} color="#FFFFFF" />
                        </View>
                        <View style={styles.splitTextWrap}>
                          {isPayer ? (
                            <ThemedText style={styles.splitText}>
                              <ThemedText style={styles.splitName}>{name}</ThemedText>
                              <ThemedText type="small" themeColor="textSecondary"> paid </ThemedText>
                              <ThemedText style={styles.splitPaidAmount}>₹{expense.amount.toFixed(2)}</ThemedText>
                              <ThemedText type="small" themeColor="textSecondary"> and owes </ThemedText>
                              <ThemedText style={[styles.splitOwesAmount, { color: theme.danger }]}>₹{split.owedAmount.toFixed(2)}</ThemedText>
                            </ThemedText>
                          ) : (
                            <ThemedText style={styles.splitText}>
                              <ThemedText style={styles.splitName}>{name}</ThemedText>
                              <ThemedText type="small" themeColor="textSecondary"> owes </ThemedText>
                              <ThemedText style={[styles.splitOwesAmount, { color: theme.danger }]}>₹{split.owedAmount.toFixed(2)}</ThemedText>
                            </ThemedText>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.five },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.four,
    paddingTop: Spacing.three,
    flex: 1,
  },
  backButton: {
    padding: Spacing.one,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginLeft: 'auto',
  },
  headerAction: {
    padding: Spacing.one,
  },
  loader: {
    marginTop: 40,
  },
  content: {
    gap: Spacing.three,
  },
  card: {
    borderRadius: BorderRadius,
    padding: Spacing.four,
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  amount: {
    fontSize: 40,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  note: {
    marginBottom: Spacing.two,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: Spacing.one,
    marginRight: Spacing.one,
  },
  splitsCard: {
    borderRadius: BorderRadius,
    padding: Spacing.three,
  },
  splitsTitle: {
    marginBottom: Spacing.three,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  splitUserRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    flex: 1,
  },
  smallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  splitTextWrap: {
    flex: 1,
  },
  splitText: {
    fontSize: 14,
    lineHeight: 20,
  },
  splitName: {
    fontWeight: '600',
  },
  splitPaidAmount: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  splitOwesAmount: {
    fontWeight: '600',
  },
});
