import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, TextInput, Linking, TouchableOpacity, FlatList, Pressable, ActivityIndicator } from 'react-native';
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
import { checkUserByEmail, searchUsersByEmail } from '@/services/userService';
import { isValidEmail } from '@/utils/validators';
import { Spacing, BorderRadius } from '@/constants/theme';
import type { User } from '@/types/group';

export default function CreateGroupScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [groupName, setGroupName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [members, setMembers] = useState<{ email: string; userId: string | null }[]>([]);
  const [suggestions, setSuggestions] = useState<(User & { id: string })[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const createGroupMutation = useCreateGroup();
  const upsertUserMutation = useUpsertUser();

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = memberEmail.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const id = user?.id;

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const excludeIds = id ? [id] : [];
      const { users } = await searchUsersByEmail(trimmed, excludeIds);
      setSearching(false);
      if (trimmed === memberEmail.trim()) {
        setSuggestions(users);
        setShowSuggestions(users.length > 0);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [memberEmail, user?.id]);

  const handleSelectSuggestion = (suggestedUser: User & { id: string }) => {
    if (members.some(m => m.email === suggestedUser.email)) {
      showToast('error', 'Email already added');
      setShowSuggestions(false);
      return;
    }
    setMembers([...members, { email: suggestedUser.email, userId: suggestedUser.id }]);
    setMemberEmail('');
    setShowSuggestions(false);
  };

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
      setShowSuggestions(false);
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
                  onChangeText={(text) => {
                    setMemberEmail(text);
                    setShowSuggestions(false);
                  }}
                  placeholder="Enter email address"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onSubmitEditing={addMember}
                />
                {searching && (
                  <ActivityIndicator size="small" color={theme.primary} style={styles.searchSpinner} />
                )}
              </View>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: theme.primary }]}
                onPress={addMember}>
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {showSuggestions && (
              <View style={[styles.suggestionsList, { backgroundColor: theme.background, borderColor: theme.backgroundElement }]}>
                <FlatList
                  data={suggestions}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <Pressable
                      style={({ pressed }) => [
                        styles.suggestionItem,
                        { backgroundColor: pressed ? theme.backgroundSelected : 'transparent' },
                      ]}
                      onPress={() => handleSelectSuggestion(item)}
                    >
                      <View style={[styles.suggestionAvatar, { backgroundColor: theme.primary }]}>
                        <ThemedText style={styles.suggestionAvatarText}>
                          {(item.name || item.email).charAt(0).toUpperCase()}
                        </ThemedText>
                      </View>
                      <View style={styles.suggestionInfo}>
                        <ThemedText style={styles.suggestionName} numberOfLines={1}>
                          {item.name || 'Unknown'}
                        </ThemedText>
                        <ThemedText themeColor="textSecondary" style={styles.suggestionEmail} numberOfLines={1}>
                          {item.email}
                        </ThemedText>
                      </View>
                      <Ionicons name="add-circle-outline" size={22} color={theme.primary} />
                    </Pressable>
                  )}
                />
              </View>
            )}

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
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius,
    padding: Spacing.three,
  },
  emailInput: { flex: 1, fontSize: 16 },
  searchSpinner: { marginLeft: Spacing.two },
  suggestionsList: {
    borderRadius: BorderRadius,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: Spacing.one,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two,
    gap: Spacing.two,
  },
  suggestionAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionEmail: {
    fontSize: 12,
  },
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
