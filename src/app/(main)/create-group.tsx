import { useState } from 'react';
import { StyleSheet, View, ScrollView, TextInput, Linking, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Toast, showToast } from '@/components/Toast';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/authStore';
import { useCreateGroup } from '@/hooks/useGroups';
import { useUpsertUser } from '@/hooks/useUser';
import { checkUserByEmail } from '@/services/userService';
import { isValidEmail } from '@/utils/validators';
import { Spacing, BorderRadius } from '@/constants/theme';

export default function CreateGroupScreen() {
  const theme = useTheme();
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

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !user?.id) return;

    const memberIds = members.map(m => m.userId).filter(Boolean) as string[];
    if (memberIds.length === 0) {
      showToast('error', 'Add at least one member');
      return;
    }

    createGroupMutation.mutate(
      {
        name: groupName.trim(),
        memberIds: [user.id, ...memberIds],
      },
      {
        onSuccess: () => {
          showToast('success', 'Group created successfully!');
          setTimeout(() => router.replace('/(main)'), 500);
        },
        onError: (error: any) => {
          showToast('error', error.message || 'Failed to create group');
        },
      }
    );
  };

  const handleInviteByEmail = async () => {
    if (!memberEmail.trim()) return;

    if (!isValidEmail(memberEmail)) {
      showToast('error', 'Invalid email format');
      return;
    }

    const subject = `Join my group on Kharchaa`;
    const body = `Hey! I've created a group "${groupName}" on Kharchaa. Please sign up to join.`;
    const url = `mailto:${memberEmail.trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      await Linking.openURL(url);
      showToast('info', 'Email client opened');
    } catch {
      showToast('error', 'Failed to open email client');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Toast />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <ThemedText type="title">Create Group</ThemedText>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.section}>
            <ThemedText type="small" style={styles.label}>GROUP NAME</ThemedText>
            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundElement }]}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Enter group name"
                placeholderTextColor={theme.textSecondary}
                autoFocus
              />
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="small" style={styles.label}>ADD MEMBERS</ThemedText>
            <View style={styles.emailInputRow}>
              <View style={[styles.emailInputContainer, { backgroundColor: theme.backgroundElement }]}>
                <TextInput
                  style={[styles.emailInput, { color: theme.text }]}
                  value={memberEmail}
                  onChangeText={setMemberEmail}
                  placeholder="Enter email address"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="email-address"
                  onSubmitEditing={addMember}
                />
              </View>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: theme.primary }]}
                onPress={addMember}>
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.memberList}>
              {members.map((member) => (
                <View key={member.email} style={[styles.memberItem, { backgroundColor: theme.backgroundElement }]}>
                  <View style={styles.memberInfo}>
                    <View style={[styles.memberAvatar, { backgroundColor: theme.primary }]}>
                      <ThemedText style={[styles.memberAvatarText, { color: '#FFFFFF' }]}>
                        {member.email.charAt(0).toUpperCase()}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.memberEmail}>{member.email}</ThemedText>
                  </View>
                  <View style={styles.memberActions}>
                    {!member.userId && (
                      <TouchableOpacity
                        style={[styles.inviteButton, { backgroundColor: theme.backgroundSelected }]}
                        onPress={handleInviteByEmail}>
                        <ThemedText style={[styles.inviteButtonText, { color: theme.primary }]}>Invite</ThemedText>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => removeMember(member.email)}>
                      <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.createButton,
              { backgroundColor: theme.primary },
              (!groupName.trim() || members.length === 0) && styles.createButtonDisabled,
            ]}
            onPress={handleCreateGroup}
            disabled={!groupName.trim() || members.length === 0 || createGroupMutation.isPending}>
            <ThemedText style={[styles.createButtonText, { color: '#FFFFFF' }]}>
              {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
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
    borderRadius: BorderRadius,
    padding: Spacing.three,
  },
  emailInput: { fontSize: 16 },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberList: { gap: Spacing.one },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: { fontSize: 14, fontWeight: '600' },
  memberEmail: { flex: 1, fontSize: 14 },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  inviteButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 6,
  },
  inviteButtonText: { fontSize: 12, fontWeight: '600' },
  createButton: {
    borderRadius: BorderRadius,
    padding: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  createButtonDisabled: { opacity: 0.5 },
  createButtonText: { fontSize: 16, fontWeight: '600' },
});
