import { useMemo, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography } from '@/theme';
import { signIn } from '@/services/auth';
import { loginSlogans } from '@/content/loginSlogans';

export default function LoginScreen() {
  const { registered } = useLocalSearchParams<{ registered?: string }>();

  const subtitle = useMemo(() => {
    const sloganIndex = Math.floor(Math.random() * loginSlogans.length);
    return loginSlogans[sloganIndex];
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackVisible, setSnackVisible] = useState(registered === '1');

  async function handleSignIn() {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    const { error: authError } = await signIn(email.trim(), password);
    setLoading(false);
    if (authError) {
      setError('Incorrect email or password. Try again.');
    }
    // Navigation handled by AuthContext listener in _layout.tsx
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.signInBox}>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

            <View style={styles.form}>
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
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                mode="outlined"
                style={styles.input}
                outlineColor={colors.neutral[300]}
                activeOutlineColor={colors.primary.default}
                right={
                  <TextInput.Icon
                    icon={passwordVisible ? 'eye-off' : 'eye'}
                    onPress={() => setPasswordVisible(!passwordVisible)}
                  />
                }
              />

              {error ? (
                <HelperText type="error" visible={!!error} style={styles.errorText}>
                  {error}
                </HelperText>
              ) : null}

              <Button
                mode="contained"
                onPress={handleSignIn}
                loading={loading}
                disabled={loading}
                style={styles.button}
                contentStyle={styles.buttonContent}
                buttonColor={colors.primary.default}
                labelStyle={styles.buttonLabel}
              >
                Sign In
              </Button>
            </View>

            <Text style={styles.hint}>
              Don't have an account? Too bad maybe you'll get an invite link.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={4000}
      >
        Account created! Sign in to get started. ✂️
      </Snackbar>
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
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
    paddingBottom: spacing[5],
  },
  signInBox: {
    width: '100%',
    padding: spacing[5],
    borderRadius: 16,
    backgroundColor: colors.surface.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[5],
    textAlign: 'center',
  },
  form: {
    width: '100%',
    gap: spacing[2],
  },
  input: {
    backgroundColor: colors.surface.card,
  },
  errorText: {
    marginTop: -spacing[1],
  },
  button: {
    marginTop: spacing[2],
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: spacing[1],
  },
  buttonLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  hint: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[5],
    textAlign: 'center',
  },
});
