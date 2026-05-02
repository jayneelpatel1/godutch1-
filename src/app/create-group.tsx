import { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Alert, TextInput as RNTextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGroupStore } from '@/store/groupStore';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { mockUsers } from '@/data/mockData';

export default function CreateGroupScreen() {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const addGroup = useGroupStore((state) => state.addGroup);

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    if (selectedMembers.length === 0) {
      Alert.alert('Error', 'Please select at least one member');
      return;
    }

    setIsCreating(true);

    const groupId = `group_${Date.now()}`;
    const newGroup = {
      id: groupId,
      name: groupName.trim(),
      created_by: 'user1',
      created_at: new Date().toISOString(),
      members: selectedMembers.map(userId => ({
        group_id: groupId,
        user_id: userId,
        joined_at: new Date().toISOString(),
      })),
      memberCount: selectedMembers.length + 1,
    };

    addGroup(newGroup);
    setIsCreating(false);
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </Pressable>
          <ThemedText type="title">New Group</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
              GROUP NAME
            </ThemedText>
            <View style={styles.inputContainer}>
              <Ionicons name="people-outline" size={20} color={Colors.light.textSecondary} />
              <RNTextInput
                style={styles.input}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Enter group name"
                placeholderTextColor={Colors.light.textSecondary}
                autoFocus
              />
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
              ADD MEMBERS
            </ThemedText>
            {mockUsers
              .filter((u) => u.id !== 'user1')
              .map((user) => {
                const isSelected = selectedMembers.includes(user.id);
                return (
                  <Pressable
                    key={user.id}
                    style={({ pressed }) => [
                      styles.memberItem,
                      isSelected && styles.memberSelected,
                      pressed && styles.memberPressed,
                    ]}
                    onPress={() => toggleMember(user.id)}>
                    <View style={styles.memberAvatar}>
                      <ThemedText style={styles.memberAvatarText}>
                        {user.name.charAt(0).toUpperCase()}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.memberName}>{user.name}</ThemedText>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color={Colors.light.primary} />
                    )}
                  </Pressable>
                );
              })}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.createButton,
              (isCreating || !groupName.trim()) && styles.createButtonDisabled,
              pressed && styles.createButtonPressed,
            ]}
            onPress={handleCreate}
            disabled={isCreating || !groupName.trim()}>
            <ThemedText style={styles.createButtonText}>
              {isCreating ? 'Creating...' : 'Create Group'}
            </ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  backButton: { padding: Spacing.one },
  placeholder: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.five },
  section: { marginBottom: Spacing.four },
  label: { marginBottom: Spacing.two, textTransform: 'uppercase', letterSpacing: 1 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: BorderRadius,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  input: { flex: 1, fontSize: 16 },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: BorderRadius,
    padding: Spacing.three,
    marginBottom: Spacing.one,
    gap: Spacing.two,
  },
  memberSelected: { borderWidth: 2, borderColor: Colors.light.primary },
  memberPressed: { opacity: 0.85 },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  memberName: { flex: 1, fontSize: 16 },
  createButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius,
    padding: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  createButtonDisabled: { opacity: 0.5 },
  createButtonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  createButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
