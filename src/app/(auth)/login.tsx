import React, { useState } from 'react';
import { StyleSheet, View, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { signInWithEmail } from '@/services/authService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSendOTP = async () => {
    if (!isValidEmail) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error: authError } = await signInWithEmail(email.trim());

    setIsLoading(false);

    if (authError) {
      setError(authError);
    } else {
      router.push({
        pathname: '/(auth)/otp',
        params: { email: email.trim() },
      });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="wallet-outline" size={64} color={Colors.light.primary} />
              </View>
              <ThemedText type="title" style={styles.title}>
                Go Dutch
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
                Split expenses, settle easily
              </ThemedText>
            </View>

            <View style={styles.form}>
              <ThemedText type="subtitle" style={styles.label}>
                Enter your email address
              </ThemedText>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={Colors.light.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
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
                style={[styles.button, !isValidEmail && styles.buttonDisabled]}
                onPress={handleSendOTP}
                disabled={isLoading || !isValidEmail}>
                <ThemedText style={styles.buttonText}>
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </ThemedText>
              </Pressable>

              <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
                We will send you a 6-digit verification code via email
              </ThemedText>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
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
  form: {
    width: '100%',
  },
  label: {
    marginBottom: Spacing.two,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: BorderRadius,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.three,
  },
  inputIcon: {
    marginRight: Spacing.two,
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingVertical: Spacing.two,
    color: Colors.light.text,
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
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    textAlign: 'center',
  },
});
