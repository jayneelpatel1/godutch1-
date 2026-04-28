import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { mockExpenses, mockUsers } from '@/data/mockData';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  food: 'restaurant-outline',
  drinks: 'cafe-outline',
  travel: 'airplane-outline',
  groceries: 'cart-outline',
  entertainment: 'film-outline',
  bills: 'receipt-outline',
  shopping: 'bag-outline',
  other: 'ellipsis-horizontal-outline',
};

export default function ActivityScreen() {
  const sortedExpenses = [...mockExpenses].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  const getUserName = (userId: string) => {
    return mockUsers.find((u) => u.id === userId)?.name || 'Unknown';
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title">Activity</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {sortedExpenses.length} recent expenses
          </ThemedText>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {sortedExpenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={Colors.light.textSecondary} />
              <ThemedText type="subtitle" style={styles.emptyTitle}>No activity yet</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">Expenses will appear here</ThemedText>
            </View>
          ) : (
            sortedExpenses.map((expense) => {
              const iconName = CATEGORY_ICONS[expense.category] || 'ellipsis-horizontal-outline';
              const isPaidByYou = expense.paidBy === 'user1';
              return (
                <View key={expense.id} style={styles.item}>
                  <View style={styles.iconWrap}>
                    <Ionicons name={iconName} size={22} color={Colors.light.primary} />
                  </View>
                  <View style={styles.info}>
                    <ThemedText type="subtitle">{expense.note}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {getUserName(expense.paidBy)} paid · {expense.category}
                    </ThemedText>
                  </View>
                  <ThemedText
                    type="subtitle"
                    style={[styles.amount, isPaidByYou ? styles.amountPositive : styles.amountNeutral]}>
                    ${expense.amount.toFixed(2)}
                  </ThemedText>
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three },
  header: { paddingVertical: Spacing.four },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.five },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
  },
  emptyTitle: { marginTop: Spacing.two, marginBottom: Spacing.one },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: BorderRadius,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, marginLeft: Spacing.two },
  amount: { fontWeight: '600' },
  amountPositive: { color: Colors.light.success },
  amountNeutral: { color: Colors.light.text },
});