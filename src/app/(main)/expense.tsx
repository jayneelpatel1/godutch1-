import { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

const categories = [
  { id: 'food', label: 'Food', icon: 'restaurant-outline' as const },
  { id: 'travel', label: 'Travel', icon: 'airplane-outline' as const },
  { id: 'groceries', label: 'Groceries', icon: 'cart-outline' as const },
  { id: 'entertainment', label: 'Fun', icon: 'film-outline' as const },
  { id: 'bills', label: 'Bills', icon: 'receipt-outline' as const },
  { id: 'drinks', label: 'Drinks', icon: 'cafe-outline' as const },
  { id: 'shopping', label: 'Shopping', icon: 'bag-outline' as const },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' as const },
];

const splitTypes = [
  { id: 'equal', label: 'Equal' },
  { id: 'exact', label: 'Exact' },
  { id: 'percent', label: 'Percent' },
  { id: 'ratio', label: 'Ratio' },
];

export default function AddExpenseScreen() {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('');
  const [splitType, setSplitType] = useState('equal');

  const handleAddExpense = () => {
    if (!amount || !note || !category) return;
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.amountSection}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.amountLabel}>
              AMOUNT
            </ThemedText>
            <View style={styles.amountRow}>
              <ThemedText style={styles.currency}>$</ThemedText>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>
          </View>

          <View style={styles.section}>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="What's it for?"
              placeholderTextColor={Colors.light.textSecondary}
            />
          </View>

          <View style={styles.section}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
              CATEGORY
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    category === cat.id && styles.categorySelected,
                  ]}
                  onPress={() => setCategory(cat.id)}>
                  <View style={[styles.categoryIconWrap, category === cat.id && styles.categoryIconWrapSelected]}>
                    <Ionicons
                      name={cat.icon}
                      size={22}
                      color={category === cat.id ? '#FFFFFF' : Colors.light.primary}
                    />
                  </View>
                  <ThemedText
                    style={[
                      styles.categoryLabel,
                      category === cat.id && styles.categoryLabelSelected,
                    ]}>
                    {cat.label}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
              SPLIT TYPE
            </ThemedText>
            <View style={styles.splitTypeRow}>
              {splitTypes.map((type) => (
                <Pressable
                  key={type.id}
                  style={[
                    styles.splitTypeButton,
                    splitType === type.id && styles.splitTypeSelected,
                  ]}
                  onPress={() => setSplitType(type.id)}>
                  <ThemedText
                    style={[
                      styles.splitTypeText,
                      splitType === type.id && styles.splitTypeTextSelected,
                    ]}>
                    {type.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              (!amount || !note || !category) && styles.buttonDisabled,
            ]}
            onPress={handleAddExpense}
            disabled={!amount || !note || !category}>
            <ThemedText style={styles.buttonText}>Add Expense</ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three },
  scrollView: { flex: 1 },
  amountSection: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: BorderRadius,
    marginBottom: Spacing.four,
  },
  amountLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.two,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currency: {
    fontSize: 40,
    fontWeight: '300',
    color: Colors.light.textSecondary,
  },
  amountInput: {
    fontSize: 56,
    fontWeight: '700',
    color: Colors.light.text,
    minWidth: 120,
  },
  section: { marginBottom: Spacing.three },
  label: {
    marginBottom: Spacing.one,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  noteInput: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: BorderRadius,
    padding: Spacing.three,
    fontSize: 16,
    color: Colors.light.text,
  },
  categoryScroll: {
    paddingVertical: Spacing.one,
  },
  categoryItem: {
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    marginRight: Spacing.two,
    minWidth: 72,
  },
  categorySelected: {},
  categoryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  categoryIconWrapSelected: {
    backgroundColor: Colors.light.primary,
  },
  categoryLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  categoryLabelSelected: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  splitTypeRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  splitTypeButton: {
    flex: 1,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
  },
  splitTypeSelected: {
    backgroundColor: Colors.light.primary,
  },
  splitTypeText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.text,
  },
  splitTypeTextSelected: {
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius,
    padding: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.four,
    marginBottom: Spacing.five,
  },
  buttonPressed: { opacity: 0.8 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});