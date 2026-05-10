import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, TextInput, Pressable, Linking, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useGroupStore } from '@/store/groupStore';
import { addGroupMember } from '@/services/groupService';
import { checkUserByEmail, fetchUsersByIds, searchUsersByEmail } from '@/services/userService';
import { isValidEmail } from '@/utils/validators';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Toast, showToast } from '@/components/Toast';
import type { User } from '@/types/group';

export default function AddMemberScreen() {
  const theme = useTheme();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { groups, addMemberToGroup } = useGroupStore();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [members, setMembers] = useState<(User & { id: string })[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [suggestions, setSuggestions] = useState<(User & { id: string })[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const group = groups.find((g) => g.id === groupId);

  // Fetch current group members
  useEffect(() => {
    if (!group?.members || group.members.length === 0) {
      setLoadingMembers(false);
      return;
    }

    const userIds = group.members.map((m) => m.user_id);
    fetchUsersByIds(userIds).then((result) => {
      if (result.users) {
        setMembers(result.users);
      }
      setLoadingMembers(false);
    }).catch((e) => {
      console.error('[AddMember] Failed to fetch group members:', e);
      setLoadingMembers(false);
    });
  }, [group?.id]);

  const memberIds = useMemo(() => members.map((m) => m.id), [members]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = email.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const { users } = await searchUsersByEmail(trimmed, memberIds);
      setSuggestions(users);
      setShowSuggestions(users.length > 0);
      setSearching(false);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [email, memberIds]);

  const handleSelectSuggestion = (user: User & { id: string }) => {
    setEmail(user.email);
    setShowSuggestions(false);
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        setEmail('');
        setShowInvite(false);
        setSuggestions([]);
        setShowSuggestions(false);
      };
    }, [])
  );

  const handleAddMember = async () => {
    if (!email.trim()) {
      showToast('error', 'Please enter an email');
      return;
    }

    if (!isValidEmail(email)) {
      showToast('error', 'Invalid email format');
      return;
    }

    setIsLoading(true);

    try {
      const { exists, user, error } = await checkUserByEmail(email);

      if (error) {
        showToast('error', 'Failed to check user');
        setIsLoading(false);
        return;
      }

      if (!exists || !user) {
        setShowInvite(true);
        showToast('error', 'Email not registered');
        setIsLoading(false);
        return;
      }

      const { error: addError } = await addGroupMember(groupId, user.id, '');

      if (addError) {
        showToast('error', addError);
        setIsLoading(false);
        return;
      }

      addMemberToGroup(groupId, user.id);
      showToast('success', 'Member added successfully');

      setTimeout(() => {
        router.back();
      }, 1500);
    } catch {
      showToast('error', 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvite = () => {
    const subject = 'Join me on Kharchaa';
    const body = `Hey! Join my expense group on Kharchaa app.\n\nDownload Kharchaa:\n- App Store: [Link coming soon]\n- Play Store: [Link coming soon]`;
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailtoUrl);
  };

  return (
    <ThemedView style={styles.container}>
      <Toast />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <ThemedText type="title">Add Member</ThemedText>
        </View>

        {/* Current Members List */}
        <View style={styles.section}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
            CURRENT MEMBERS ({members.length})
          </ThemedText>
          {loadingMembers ? (
            <ActivityIndicator size="small" color={theme.primary} style={styles.loader} />
          ) : (
            <View style={styles.memberList}>
              {members.map((member) => (
                <View key={member.id} style={[styles.memberItem, { backgroundColor: theme.backgroundElement }]}>
                  <View style={[styles.memberAvatar, { backgroundColor: theme.primary }]}>
                    <ThemedText style={[styles.memberAvatarText, { color: '#FFFFFF' }]}>
                      {(member.name || member.email)?.charAt(0).toUpperCase()}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.memberName}>{member.name || member.email}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.content, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
            MEMBER EMAIL
          </ThemedText>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setShowInvite(false);
                setShowSuggestions(false);
              }}
              placeholder="Enter email address"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
            {searching && (
              <ActivityIndicator size="small" color={theme.primary} style={styles.searchSpinner} />
            )}
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
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: theme.primary },
            pressed && styles.buttonPressed,
            isLoading && styles.buttonDisabled,
          ]}
          onPress={handleAddMember}
          disabled={isLoading}>
          <ThemedText style={styles.addButtonText}>
            {isLoading ? 'Adding...' : 'Add Member'}
          </ThemedText>
        </Pressable>

        {showInvite && (
          <Pressable
            style={({ pressed }) => [
              styles.inviteButton,
              { borderColor: theme.primary },
              pressed && styles.buttonPressed,
            ]}
            onPress={handleSendInvite}>
            <Ionicons name="mail-outline" size={20} color={theme.primary} />
            <ThemedText style={[styles.inviteButtonText, { color: theme.primary }]}>Send Invite Email</ThemedText>
          </Pressable>
        )}
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
  section: {
    marginBottom: Spacing.four,
  },
  label: {
    marginBottom: Spacing.one,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loader: {
    paddingVertical: Spacing.three,
  },
  memberList: {
    gap: Spacing.one,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: BorderRadius,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  memberName: {
    fontSize: 14,
    flex: 1,
  },
  content: {
    gap: Spacing.three,
  },
  inputCard: {
    borderRadius: BorderRadius,
    padding: Spacing.three,
  },
  inputRow: {},
  input: {
    fontSize: 16,
    paddingVertical: Spacing.two,
  },
  addButton: {
    borderRadius: BorderRadius,
    padding: Spacing.three,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: { opacity: 0.8 },
  buttonDisabled: { opacity: 0.5 },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius,
    padding: Spacing.three,
    gap: Spacing.two,
    borderWidth: 1,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchSpinner: {
    marginLeft: Spacing.two,
  },
  suggestionsList: {
    borderRadius: BorderRadius,
    borderWidth: 1,
    overflow: 'hidden',
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
});
