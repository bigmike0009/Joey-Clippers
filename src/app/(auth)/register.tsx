import { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText, Banner } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography } from '@/theme';
import { signUp } from '@/services/auth';
import { getInvitePreview, redeemInvite } from '@/services/invites';
import { LoadingState } from '@/components/LoadingState';
import { useMinimumLoading } from '@/hooks/useMinimumLoading';

type InviteState =
  | { status: 'checking' }
  | { status: 'valid'; email: string | null }
  | { status: 'invalid' }
  | { status: 'no_token' };

export default function RegisterScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();

  const [invite, setInvite] = useState<InviteState>(
    token ? { status: 'checking' } : { status: 'no_token' },
  );

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const showInviteChecking = useMinimumLoading(invite.status === 'checking');

  useEffect(() => {
    if (!token) return;
    getInvitePreview(token).then(({ data, error }) => {
      if (error || !data?.length) {
        setInvite({ status: 'invalid' });
        return;
      }
      const preview = data[0];
      if (!preview.is_valid) {
        setInvite({ status: 'invalid' });
        return;
      }
      setInvite({ status: 'valid', email: preview.email ?? null });
      if (preview.email) setEmail(preview.email);
    });
  }, [token]);

  function validate() {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = 'Name is required.';
    if (!email.trim()) errors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Enter a valid email address.';
    if (!password) errors.password = 'Password is required.';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    return errors;
  }

  async function handleRegister() {
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setSubmitError('');
    setLoading(true);

    const { error: signUpError } = await signUp(email.trim(), password, fullName.trim());
    if (signUpError) {
      setLoading(false);
      setSubmitError(signUpError.message ?? 'Registration failed. Please try again.');
      return;
    }

    if (token) {
      await redeemInvite(token);
    }

    setLoading(false);
    // Navigation handled by AuthContext in _layout.tsx
  }

  if (invite.status === 'no_token') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Invite required</Text>
          <Text style={styles.errorBody}>
            Registration is invite-only. Ask Joe for a link.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showInviteChecking) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState label="Checking your invite..." />
      </SafeAreaView>
    );
  }

  if (invite.status === 'invalid') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Invite expired or already used</Text>
          <Text style={styles.errorBody}>Ask Joe for a fresh invite link.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Join Joe's Clippers</Text>
          <Text style={styles.subtitle}>Create your account to book cuts</Text>

          {submitError ? (
            <Banner visible icon="alert-circle" style={styles.banner}>
              {submitError}
            </Banner>
          ) : null}

          <View style={styles.form}>
            <TextInput
              label="Full name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoComplete="name"
              mode="outlined"
              style={styles.input}
              outlineColor={colors.neutral[300]}
              activeOutlineColor={colors.primary.default}
              error={!!fieldErrors.fullName}
            />
            {fieldErrors.fullName ? (
              <HelperText type="error">{fieldErrors.fullName}</HelperText>
            ) : null}

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              mode="outlined"
              style={styles.input}
              outlineColor={colors.neutral[300]}
              activeOutlineColor={colors.primary.default}
              error={!!fieldErrors.email}
            />
            {fieldErrors.email ? (
              <HelperText type="error">{fieldErrors.email}</HelperText>
            ) : null}

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
              mode="outlined"
              style={styles.input}
              outlineColor={colors.neutral[300]}
              activeOutlineColor={colors.primary.default}
              error={!!fieldErrors.password}
              right={
                <TextInput.Icon
                  icon={passwordVisible ? 'eye-off' : 'eye'}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                />
              }
            />
            {fieldErrors.password ? (
              <HelperText type="error">{fieldErrors.password}</HelperText>
            ) : null}

            <TextInput
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!passwordVisible}
              mode="outlined"
              style={styles.input}
              outlineColor={colors.neutral[300]}
              activeOutlineColor={colors.primary.default}
              error={!!fieldErrors.confirmPassword}
            />
            {fieldErrors.confirmPassword ? (
              <HelperText type="error">{fieldErrors.confirmPassword}</HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
              buttonColor={colors.primary.default}
              labelStyle={styles.buttonLabel}
            >
              Create Account
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[8],
    paddingBottom: spacing[8],
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    gap: spacing[3],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[6],
  },
  errorTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  errorBody: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  banner: {
    marginBottom: spacing[4],
    backgroundColor: '#FEE2E2',
  },
  form: {
    gap: spacing[1],
  },
  input: {
    backgroundColor: colors.surface.card,
  },
  button: {
    marginTop: spacing[4],
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: spacing[1],
  },
  buttonLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});
