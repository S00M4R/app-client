import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { colors, radius, spacing, type } from '@/constants/theme';

export default function SignUp() {
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!displayName.trim() || !email.trim() || !password) {
      setError('Fill in your name, email, and password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const { error: signUpError } = await signUp(email.trim(), password, displayName.trim());
    setIsSubmitting(false);
    if (signUpError) {
      setError(signUpError);
    } else {
      setInfo('Check your email to confirm your account, then sign in.');
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.heading}>Create your account</Text>
          <Text style={styles.subheading}>Join your neighbors keeping each other informed.</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Jane Doe"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="At least 8 characters"
              placeholderTextColor={colors.textSecondary}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {info ? <Text style={styles.infoText}>{info}</Text> : null}

            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? 'Creating account…' : 'Create account'}
              </Text>
            </Pressable>

            <Link href="/(auth)/sign-in" asChild>
              <Pressable style={styles.secondaryLink}>
                <Text style={styles.secondaryLinkText}>
                  Already have an account? <Text style={styles.secondaryLinkAccent}>Sign in</Text>
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  heading: {
    fontSize: type.sizes.xxl,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xxs
  },
  subheading: {
    fontSize: type.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg
  },
  form: {},
  label: {
    fontSize: type.sizes.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xxs,
    marginTop: spacing.sm
  },
  input: {
    backgroundColor: colors.paperMuted,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: type.sizes.md,
    color: colors.textPrimary
  },
  errorText: { color: colors.danger, fontSize: type.sizes.sm, marginTop: spacing.sm },
  infoText: { color: colors.success, fontSize: type.sizes.sm, marginTop: spacing.sm },
  primaryButton: {
    backgroundColor: colors.amber,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    marginTop: spacing.lg
  },
  pressed: { opacity: 0.85 },
  primaryButtonText: { color: colors.ink, fontWeight: '700', fontSize: type.sizes.md },
  secondaryLink: { marginTop: spacing.md, alignItems: 'center' },
  secondaryLinkText: { color: colors.textSecondary, fontSize: type.sizes.sm },
  secondaryLinkAccent: { color: colors.amberDeep, fontWeight: '700' }
});
