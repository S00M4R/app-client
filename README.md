# Nearby — Expo Client

A live map where signed-in users drop pins reporting local issues (crime,
burst pipes, potholes, outages, and more) that everyone sees in real time.
Pairs with the Supabase backend delivered earlier (schema + RLS + RPCs).

## Setup

```bash
# 1. Create the project structure from these files (or copy them into
#    a fresh `npx create-expo-app` project — this is not a zero-install
#    template, it's the source tree).
npm install

# 2. Configure environment
cp .env.example .env
# fill in SUPABASE_URL and SUPABASE_ANON_KEY from your Supabase project
# (Project Settings → API). Google Maps keys are optional — iOS falls
# back to Apple Maps with no key; Android requires a key to render tiles.

# 3. Run
npx expo start
```

You'll need a development build (not Expo Go) because `react-native-maps`
requires native code:

```bash
npx expo prebuild
npx expo run:ios      # or
npx expo run:android
```

## What's here

| Path | Purpose |
|---|---|
| `app/(auth)/` | Sign in / sign up screens (Supabase email+password auth) |
| `app/(app)/map.tsx` | The live map — the core screen |
| `app/(app)/reports.tsx` | List of nearby reports sorted by distance |
| `app/(app)/profile.tsx` | Signed-in user info + sign out |
| `context/AuthContext.tsx` | Session state, wraps the whole app |
| `hooks/useLiveReports.ts` | Viewport-based fetch (`reports_in_bounds` RPC) + Realtime subscription that patches pins in place |
| `hooks/useCategories.ts` | Loads pin types from `report_categories` (data-driven, not hardcoded) |
| `components/ReportPin.tsx` | Map marker; pins created in the last 5 min get a pulse animation |
| `components/NewReportSheet.tsx` | Category picker + form for dropping a new pin |
| `components/ReportDetailSheet.tsx` | Tap a pin → details + upvote ("still happening") |
| `constants/theme.ts` | Design tokens (colors, type, spacing) |

## How the live map works

1. `MapView` fires `onRegionChangeComplete` as the user pans/zooms.
2. `useLiveReports` debounces that (400ms) and calls the `reports_in_bounds`
   Postgres function with the current viewport's bounding box — so you're
   never pulling the whole `reports` table, just what's on screen.
3. In parallel, a Supabase Realtime channel subscribes to `postgres_changes`
   on `public.reports`. When another user drops a pin, the INSERT event
   patches local state directly (no refetch) if it falls within the last
   loaded viewport and the active category filter.
4. New pins pulse for 5 minutes so it's visually obvious something just
   happened, then settle into a normal marker.

## Reporting flow

Tap the **+** button → a crosshair appears at the map's center → drag the
map to position it precisely → **Report issue here** opens the form
(category, title, optional description/photo-ready field, severity,
anonymous toggle) → inserts into `reports` with `reporter_id = auth.uid()`,
enforced by RLS.

## Known gaps to build next (say the word)

- **Photo upload**: `report.photo_urls` and the `image-picker` dependency
  are wired in for this, but the upload-to-Supabase-Storage step isn't
  built yet — needs a `report-photos` bucket (see backend README) and an
  upload call before/after the insert.
- **Push notifications** for new reports near a saved home location.
- **Moderator/admin status changes** (marking something resolved) — by
  design the current RLS only lets a user edit their own report, so this
  needs a service-role Edge Function once you have a moderator role.
- **Offline queue** for reports made with no signal.
