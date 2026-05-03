import { useState } from 'react';
import { StyleSheet, View, ScrollView, TextInput, Linking, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Toast, showToast } from '@/components/Toast';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/store/authStore';
import { useCreateGroup } from '@/hooks/useGroups';
import { useUpsertUser } from '@/hooks/useUser';
import { checkUserByEmail } from '@/services/userService';
import { isValidEmail } from '@/utils/validators';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

export default function CreateGroupScreen() {
  const { user } = useAuthStore();
  const [groupName, setGroupName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [members, setMembers] = useState<{ email: string; userId: string | null }[]>([]);

  const createGroupMutation = useCreateGroup();
  const upsertUserMutation = useUpsertUser();

  const addMember = async () => {
    if (!memberEmail.trim()) return;

    if (!isValidEmail(memberEmail)) {
      showToast('error', 'Invalid email format');
      return;
    }

    const trimmedEmail = memberEmail.trim();

    if (members.some(m => m.email === trimmedEmail)) {
      showToast('error', 'Email already added');
      return;
    }

    try {
      const { exists, user: foundUser } = await checkUserByEmail(trimmedEmail);
      const userId = exists && foundUser ? foundUser.id : null;

      setMembers([...members, { email: trimmedEmail, userId }]);
      setMemberEmail('');
    } catch {
      showToast('error', 'Failed to verify email');
    }
  };

  const removeMember = (email: string) => {
    setMembers(members.filter(m => m.email !== email));
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      showToast('error', 'Please enter a group name');
      return;
    }

    if (members.length === 0) {
      showToast('error', 'Please add at least one member');
      return;
    }

    if (!user?.id) {
      showToast('error', 'You must be logged in to create a group');
      return;
    }

    try {
      await upsertUserMutation.mutateAsync(user);

      // Warn about unregistered users
      const unregistered = members.filter(member => !member.userId);
      if (unregistered.length > 0) {
        showToast('error', `${unregistered.length} user(s) not registered yet. They won't see this group until they log in.`);
        console.warn('[create-group] Unregistered users:', unregistered.map(m => m.email));
      }

      // Only include registered users
      const memberIds: string[] = members
        .filter(member => member.userId)
        .map(member => member.userId as string);

      if (memberIds.length === 0) {
        showToast('error', 'No registered members to add to the group');
        return;
      }

      console.log('[create-group] Creating group with member IDs:', memberIds);
      const group = await createGroupMutation.mutateAsync({ name: groupName.trim(), memberIds });

      if (group) {
        showToast('success', 'Group created successfully');
        setTimeout(() => router.back(), 1500);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create group';
      console.error('[create-group] handleCreate error:', error);
      showToast('error', message);
    }
  };

  const sendInvite = (email: string) => {
    const subject = 'Join me on Go Dutch';
    const body = `Hey! Join my expense group "${groupName || 'New Group'}" on Go Dutch app.\n\nDownload Go Dutch:\n- App Store: [Link coming soon]\n- Play Store: [Link coming soon]`;
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(mailtoUrl);
  };

  const isLoading = createGroupMutation.isPending || upsertUserMutation.isPending;

  return (
    <ThemedView style={styles.container}>
      <Toast />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <ThemedText type="title">New Group</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="always">
          <View style={styles.section}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
              GROUP NAME
            </ThemedText>
            <View style={styles.inputContainer}>
              <Ionicons name="people-outline" size={20} color={Colors.light.textSecondary} />
              <TextInput
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
              ADD MEMBERS BY EMAIL
            </ThemedText>
            <View style={styles.emailInputRow}>
              <View style={styles.emailInputContainer}>
                <TextInput
                  style={styles.emailInput}
                  value={memberEmail}
                  onChangeText={setMemberEmail}
                  placeholder="Enter email address"
                  placeholderTextColor={Colors.light.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={addMember}
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={addMember}
                style={[
                  styles.addButton,
                  !memberEmail.trim() && { opacity: 0.5 }
                ]}>
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {members.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
                ADDED MEMBERS ({members.length})
              </ThemedText>
              {members.map((member) => (
                <View key={member.email} style={styles.memberItem}>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberAvatar}>
                      <ThemedText style={styles.memberAvatarText}>
                        {member.email.charAt(0).toUpperCase()}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.memberEmail}>{member.email}</ThemedText>
                  </View>
                  <View style={styles.memberActions}>
                    {!member.userId && (
                      <TouchableOpacity onPress={() => sendInvite(member.email)} style={styles.inviteButton}>
                        <ThemedText style={styles.inviteButtonText}>Invite</ThemedText>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => removeMember(member.email)}>
                      <Ionicons name="close-circle" size={20} color={Colors.light.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.createButton,
              (isLoading || !groupName.trim()) && styles.createButtonDisabled,
            ]}
            onPress={handleCreate}
            disabled={isLoading || !groupName.trim()}>
            <ThemedText style={styles.createButtonText}>
              {isLoading ? 'Creating...' : 'Create Group'}
            </ThemedText>
          </TouchableOpacity>
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
  emailInputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  emailInputContainer: {
    flex: 1,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: BorderRadius,
    padding: Spacing.three,
  },
  emailInput: { fontSize: 16, color: Colors.light.text },
  addButton: {
    backgroundColor: Colors.light.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: BorderRadius,
    padding: Spacing.three,
    marginBottom: Spacing.one,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.two,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  memberEmail: { flex: 1, fontSize: 14 },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  inviteButton: {
    backgroundColor: Colors.light.backgroundSelected,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 6,
  },
  inviteButtonText: { fontSize: 12, color: Colors.light.primary, fontWeight: '600' },
  createButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius,
    padding: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  createButtonDisabled: { opacity: 0.5 },
  createButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
