# Finly Current Status

## Branch: home-redesign
## Last updated: March 26, 2026

## What works ✅
- Auth: Firebase Google + Email/Password
- Onboarding: complete (name, gender, household, goals, welcome, success)
- Screen transitions: fade for auth/onboarding, slide for app screens (RTL)
- Home: 3 swipeable screens (swipe right = next, RTL correct)
  - Screen 1: balance card + Finly insight + income/expense buttons
  - Screen 2: "מה צפוי" — shows header + empty state when no recurring entries
  - Screen 3: "תנועות" — shows transactions with filter (הכל/הכנסות/הוצאות)
- Month carousel in header (tap to change month)
- FAB on screens 2 and 3
- Add transaction: numpad + details flow
- PWA installed on iPhone

## In progress 🔄
- Screen 2: missing edit, delete, mark as paid
- Screen 3: missing edit, delete, mark as paid, export PDF/Excel
- Month carousel: swipe gesture not working (tap only)
- White bar at bottom (will fix with eas build)
- Numpad auto-focus (will fix with eas build — iOS Safari limitation)

## Do NOT touch ⛔
- ScreenTransition.tsx (complex, working perfectly)
- All auth screens (complete)
- All onboarding screens (complete)
- All modal files (working)
- SwipeableScreens.tsx (just fixed, sensitive)

## Next steps (in order)
1. Screen 3: edit + delete + mark as paid + export PDF/Excel
2. Screen 2: edit + delete + mark as paid
3. Month carousel swipe gesture
4. eas build when Apple Developer account approved