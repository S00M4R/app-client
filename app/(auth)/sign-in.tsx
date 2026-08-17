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
import { MapPinned } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { colors, radius, spacing, type } from '@/constants/theme';

export default function SignIn() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const { error: signInError } = await signIn(email.trim(), password);
    setIsSubmitting(false);
    if (signInError) setError(signInError);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.brandBlock}>
            <View style={styles.iconBadge}>
              <MapPinned color={colors.amber} size={28} strokeWidth={2.2} />
            </View>
            <Text style={styles.wordmark}>NEARBY</Text>
            <Text style={styles.tagline}>See what's happening around you. Report what isn't right.</Text>
          </View>

          <View style={styles.form}>
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
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </Text>
            </Pressable>

            <Link href="/(auth)/sign-up" asChild>
              <Pressable style={styles.secondaryLink}>
                <Text style={styles.secondaryLinkText}>
                  New here? <Text style={styles.secondaryLinkAccent}>Create an account</Text>
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
  container: { flex: 1, backgroundColor: colors.ink },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  brandBlock: { alignItems: 'center', marginBottom: spacing.xxl },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.inkElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md
  },
  wordmark: {
    fontSize: type.sizes.display,
    fontWeight: '800',
    color: colors.textOnInk,
    letterSpacing: 3,
    ...type.display
  },
  tagline: {
    fontSize: type.sizes.sm,
    color: colors.textOnInkMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg
  },
  form: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    padding: spacing.lg
  },
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
  errorText: {
    color: colors.danger,
    fontSize: type.sizes.sm,
    marginTop: spacing.sm
  },
  primaryButton: {
    backgroundColor: colors.amber,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    marginTop: spacing.lg
  },
  pressed: { opacity: 0.85 },
  primaryButtonText: {
    color: colors.ink,
    fontWeight: '700',
    fontSize: type.sizes.md
  },
  secondaryLink: { marginTop: spacing.md, alignItems: 'center' },
  secondaryLinkText: { color: colors.textSecondary, fontSize: type.sizes.sm },
  secondaryLinkAccent: { color: colors.amberDeep, fontWeight: '700' }
});
