import { useState, useCallback } from 'react';
import { StyleSheet, View, TextInput, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGroupStore } from '@/store/groupStore';
import { addGroupMember } from '@/services/groupService';
import { checkUserByEmail } from '@/services/userService';
import { isValidEmail } from '@/utils/validators';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { Toast, showToast } from '@/components/Toast';

export default function AddMemberScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { addMemberToGroup } = useGroupStore();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setEmail('');
        setShowInvite(false);
      };
    }, [])
  );

  const handleAddMember = async () => {
    if (!email.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter an email' });
      return;
    }

    if (!isValidEmail(email)) {
      Toast.show({ type: 'error', text1: 'Invalid email format' });
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
      Toast.show({ type: 'error', text1: 'Something went wrong' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvite = () => {
    const subject = 'Join me on Go Dutch';
    const body = `Hey! Join my expense group on Go Dutch app.\n\nDownload Go Dutch:\n- App Store: [Link coming soon]\n- Play Store: [Link coming soon]`;
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailtoUrl);
  };

  return (
    <ThemedView style={styles.container}>
      <Toast />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.push({ pathname: '/group/[id]', params: { id: groupId } })} style={styles.backButton}>
             <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
           </Pressable>
          <ThemedText type="title">Add Member</ThemedText>
        </View>

        <View style={styles.content}>
          <View style={styles.inputCard}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
              MEMBER EMAIL
            </ThemedText>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setShowInvite(false);
                }}
                placeholder="Enter email address"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
              />
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.addButton,
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
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSendInvite}>
              <Ionicons name="mail-outline" size={20} color={Colors.light.primary} />
              <ThemedText style={styles.inviteButtonText}>Send Invite Email</ThemedText>
            </Pressable>
          )}
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
  inputCard: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: BorderRadius,
    padding: Spacing.three,
  },
  label: {
    marginBottom: Spacing.one,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputRow: {},
  input: {
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: Spacing.two,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
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
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: BorderRadius,
    padding: Spacing.three,
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  inviteButtonText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
