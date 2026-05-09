import { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import { firebaseAuth } from '@/services/firebaseConfig';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/store/authStore';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID || '';
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_FIREBASE_IOS_CLIENT_ID || '';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((state) => state.setUser);

  const handleFirebaseAuth = async (idToken: string) => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const firebaseUserCredential = await signInWithCredential(firebaseAuth, credential);
      const firebaseUser = firebaseUserCredential.user;

      const authUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || '',
        avatar: firebaseUser.photoURL || undefined,
      };

      setUser(authUser);

      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setIsLoading(false);
    }
  };

  const handleGoogleSignInWeb = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const firebaseUser = result.user;

      const authUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || '',
        avatar: firebaseUser.photoURL || undefined,
      };

      setUser(authUser);

      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (Platform.OS === 'web') {
      await handleGoogleSignInWeb();
    } else {
      setIsLoading(true);
      setError(null);
      await promptAsync({ useProxy: true, showInRecents: true });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="wallet-outline" size={64} color={Colors.light.primary} />
            </View>
            <ThemedText type="title" style={styles.title}>
              Kharchaa
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
              Split expenses, settle easily
            </ThemedText>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.light.danger} />
              <ThemedText type="small" style={styles.errorText}>
                {error}
              </ThemedText>
            </View>
          )}

          <Pressable
            style={[styles.googleButton, isLoading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#FFFFFF" />
                <ThemedText style={styles.googleButtonText}>
                  Continue with Google
                </ThemedText>
              </>
            )}
          </Pressable>

          <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
            Sign in securely with your Google account
          </ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  subtitle: {
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: BorderRadius,
    padding: Spacing.two,
    marginBottom: Spacing.three,
  },
  errorText: {
    color: Colors.light.danger,
    marginLeft: Spacing.one,
    flex: 1,
  },
  googleButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    textAlign: 'center',
  },
});
