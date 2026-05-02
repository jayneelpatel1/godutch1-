import { StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExpenseStore } from '@/store/expenseStore';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

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

export default function ExpenseDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { expenses } = useExpenseStore();

  const expense = expenses.find((e) => e.id === id);

  if (!expense) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
            </Pressable>
            <ThemedText type="title">Expense Not Found</ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </Pressable>
          <ThemedText type="title">Expense Details</ThemedText>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons
                name={categoryIcons[expense.category] as any || 'ellipsis-horizontal-outline'}
                size={32}
                color={Colors.light.primary}
              />
            </View>
            <ThemedText type="title" style={styles.amount}>
               ₹${expense.amount.toFixed(2)}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.note}>
              {expense.note || 'No description'}
            </ThemedText>
            <View style={styles.metaRow}>
              <ThemedText type="small" themeColor="textSecondary">
                {expense.category}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary"> · </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {expense.splitType} split
              </ThemedText>
            </View>
          </View>

          <View style={styles.splitsCard}>
            <ThemedText type="subtitle" style={styles.splitsTitle}>
              Split Details
            </ThemedText>
            {(expense.splits || []).map((split) => (
              <View key={split.userId} style={styles.splitRow}>
                <ThemedText style={styles.splitUser}>{split.userId}</ThemedText>
                <ThemedText style={styles.splitAmount}>
                   ₹${split.owedAmount.toFixed(2)}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.four,
    paddingTop: Spacing.three,
  },
  backButton: {
    padding: Spacing.one,
  },
  content: {
    gap: Spacing.three,
  },
  card: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: BorderRadius,
    padding: Spacing.four,
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  amount: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.one,
  },
  note: {
    marginBottom: Spacing.two,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  splitsCard: {
    backgroundColor: Colors.light.backgroundElement,
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
    borderBottomColor: Colors.light.backgroundSelected,
  },
  splitUser: {
    fontSize: 14,
    color: Colors.light.text,
  },
  splitAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
});
