import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Pressable, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { signOut } from '@/services/authService';
import { updateUser } from '@/services/userService';
import Footer from '@/components/footer';

export default function ProfileScreen() {
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  // Update name state when user changes (e.g., after saving)
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  const handleSaveName = async () => {
    if (!user) return;
    
    // Update local state immediately
    setUser({ ...user, name });
    setIsEditing(false);
    
    // Save to Supabase database
    try {
      const result = await updateUser(user.id, { name });
      if (result.error) {
        console.error('[Profile] Failed to update name:', result.error);
        if (Platform.OS === 'web') {
          window.alert('Failed to save name: ' + result.error);
        }
      }
    } catch (e: any) {
      console.error('[Profile] Error updating name:', e);
    }
  };

  const handleLogout = () => {
    // Platform-specific confirmation dialog
    if (Platform.OS === 'web') {
      // Web: use window.confirm and window.alert
      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (!confirmed) return;
      handleSignOut();
    } else {
      // Native: use React Native Alert
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: () => handleSignOut(),
          },
        ]
      );
    }
  };
  
  const handleSignOut = async () => {
    try {
      const result = await signOut();
      if (result.error) {
        const errorMsg = result.error;
        if (Platform.OS === 'web') {
          window.alert('Error: ' + errorMsg);
        } else {
          Alert.alert('Error', errorMsg);
        }
        return;
      }
      // Navigation will be handled by the auth state listener in _layout.tsx
    } catch (err) {
      const errorMsg = 'Failed to sign out. Please try again.';
      if (Platform.OS === 'web') {
        window.alert(errorMsg);
      } else {
        Alert.alert('Error', errorMsg);
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText type="title">Profile</ThemedText>
          </View>

          <View style={[styles.profileCard, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.avatarContainer}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
                  <ThemedText style={[styles.avatarText, { color: '#FFFFFF' }]}>
                    {name?.charAt(0).toUpperCase() || '?'}
                  </ThemedText>
                </View>
              )}
            </View>

            {isEditing ? (
              <View style={styles.editNameRow}>
                <TextInput
                  style={[styles.nameInput, { color: theme.text, borderBottomColor: theme.primary }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.textSecondary}
                  autoFocus
                />
                <Pressable onPress={handleSaveName} style={[styles.saveButton, { backgroundColor: theme.primary }]}>
                  <ThemedText style={[styles.saveButtonText, { color: '#FFFFFF' }]}>Save</ThemedText>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => setIsEditing(true)} style={styles.nameRow}>
                <ThemedText type="title" style={styles.name}>
                  {user?.name || 'Add your name'}
                </ThemedText>
                <Ionicons name="pencil" size={16} color={theme.textSecondary} />
              </Pressable>
            )}

            <ThemedText type="small" themeColor="textSecondary">
              {user?.email || 'No email'}
            </ThemedText>
          </View>

          <View style={[styles.section, { marginBottom: Spacing.four }]}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
              ACCOUNT
            </ThemedText>
            <View style={[styles.infoCard, { backgroundColor: theme.backgroundElement }]}>
              <View style={styles.infoRow}>
                <View style={styles.infoLabelRow}>
                  <Ionicons name="mail-outline" size={16} color={theme.textSecondary} />
                  <ThemedText style={styles.infoLabel}>Email</ThemedText>
                </View>
                <ThemedText themeColor="textSecondary">{user?.email || 'Not set'}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoLabelRow}>
                  <Ionicons name="person-outline" size={16} color={theme.textSecondary} />
                  <ThemedText style={styles.infoLabel}>Name</ThemedText>
                </View>
                <ThemedText themeColor="textSecondary">{user?.name || 'Not set'}</ThemedText>
              </View>
            </View>
          </View>

          <Pressable 
            style={[styles.logoutButton, { backgroundColor: theme.danger + '20' }]} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.danger} />
            <ThemedText style={[styles.logoutText, { color: theme.danger }]}>Sign Out</ThemedText>
          </Pressable>
          <Footer />
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
    borderRadius: BorderRadius,
    padding: Spacing.four,
    marginBottom: Spacing.four,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.half,
  },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.half,
  },
  nameInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    borderBottomWidth: 1,
    paddingVertical: Spacing.one,
  },
  saveButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  name: { marginBottom: Spacing.half },
  section: { marginBottom: Spacing.four },
  sectionLabel: {
    marginBottom: Spacing.one,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoCard: {
    borderRadius: BorderRadius,
    padding: Spacing.three,
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  logoutText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
