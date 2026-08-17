/**
 * Design tokens for Nearby.
 *
 * Direction: "a utility you trust in an emergency" — closer to dispatch /
 * signage systems than a trendy consumer app. Deep ink navy chrome, warm
 * paper-white surfaces, one confident amber accent reserved for primary
 * actions and live/active states. Severity colors come from the backend
 * (report_categories.color) so pins are data-driven, not hardcoded here.
 */

export const colors = {
  // Core
  ink: '#121D2E', // primary chrome: headers, tab bar, map controls
  inkElevated: '#1B2A40', // cards/sheets sitting on ink backgrounds
  paper: '#F7F5F1', // primary surface background
  paperMuted: '#EDE9E1', // secondary surface (input fields, chips)
  line: '#DDD6C9', // hairline borders on paper

  // Accent — used sparingly: primary CTA, active/live indicators, focus rings
  amber: '#E8A23D',
  amberDeep: '#C9821F',

  // Text
  textPrimary: '#121D2E',
  textSecondary: '#5B6472',
  textOnInk: '#F7F5F1',
  textOnInkMuted: '#9FAAB8',

  // Status (semantic — separate from category severity colors)
  success: '#2E8B57',
  danger: '#D7263D',
  warning: '#E8A23D',

  // Overlays
  scrim: 'rgba(18, 29, 46, 0.55)',
  white: '#FFFFFF',
  black: '#000000'
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
} as const;

/**
 * Type scale. Display face is condensed & slightly technical (signage
 * feel) for headers and the app wordmark; body face is a plain humanist
 * sans for legibility in a stress/utility context. Both ship with the
 * OS (no custom font loading needed) — swap `fontFamily` values below
 * for a licensed font if you add one later via expo-font.
 */
export const type = {
  display: {
    fontFamily: undefined as string | undefined, // falls back to system bold
    letterSpacing: 0.2
  },
  body: {
    fontFamily: undefined as string | undefined,
    letterSpacing: 0
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 34
  }
} as const;

export const shadow = {
  card: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3
  },
  sheet: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8
  }
} as const;
