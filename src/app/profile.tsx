import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { mockUsers, currentUserId, mockGroups, mockExpenses } from '@/data/mockData';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

export default function ProfileScreen() {
  const user = mockUsers.find((u) => u.id === currentUserId);
  const groupCount = mockGroups.length;
  const expenseCount = mockExpenses.length;
  const settledCount = mockExpenses.filter((e) => e.splitType === 'equal' && e.amount < 50).length;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText type="title">Profile</ThemedText>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <ThemedText style={styles.avatarText}>
                    {user?.name.charAt(0).toUpperCase()}
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText type="title" style={styles.name}>
              {user?.name}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {user?.phone}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
              STATS
            </ThemedText>
            <View style={styles.statsCard}>
              <View style={styles.stat}>
                <ThemedText type="title" style={styles.statNumber}>{groupCount}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Groups
                </ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <ThemedText type="title" style={styles.statNumber}>{expenseCount}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Expenses
                </ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <ThemedText type="title" style={[styles.statNumber, { color: Colors.light.success }]}>
                  {settledCount}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Settled
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
              APP INFO
            </ThemedText>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoLabelRow}>
                  <Ionicons name="information-circle-outline" size={16} color={Colors.light.textSecondary} />
                  <ThemedText style={styles.infoLabel}>Version</ThemedText>
                </View>
                <ThemedText themeColor="textSecondary">1.0.0</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoLabelRow}>
                  <Ionicons name="construct-outline" size={16} color={Colors.light.textSecondary} />
                  <ThemedText style={styles.infoLabel}>Build</ThemedText>
                </View>
                <ThemedText themeColor="textSecondary">2024.1</ThemedText>
              </View>
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
  header: { paddingVertical: Spacing.four },
  profileCard: {
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: BorderRadius,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: { marginBottom: Spacing.two },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600',
  },
  name: { marginBottom: Spacing.half },
  section: { marginBottom: Spacing.four },
  sectionLabel: {
    marginBottom: Spacing.one,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: BorderRadius,
    padding: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.light.backgroundSelected,
    marginVertical: Spacing.two,
  },
  statNumber: {
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: BorderRadius,
    padding: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  infoLabel: {
    marginLeft: Spacing.one,
  },
});