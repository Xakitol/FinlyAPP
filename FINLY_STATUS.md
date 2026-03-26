# Finly Current Status

## Branch: home-redesign
## Last updated: March 26, 2026

## What works ✅
- Auth: Firebase Google + Email/Password
- Onboarding: complete (name, gender, household, goals, welcome, success)
- Screen transitions: fade for auth/onboarding, slide for app screens (RTL)
- Home: 3 swipeable screens (swipe right = next, RTL correct)
  - Screen 1: balance card + Finly insight card (swipeable internally, no screen change)
  - Screen 2: overdue confirmation card + dual summary cards (income/expense) + empty state
  - Screen 3: transaction list with colored filters, bottom sheet on tap (edit/delete/mark as paid)
- PillBar: fixed bottom bar — הכנסה / Sparkles (home) / הוצאה
- Month picker: vertical drum roll, swipe up/down, gradient highlight
- Brand colors: cyan→lavender gradient replaces solid purple throughout
- Filter buttons: הכל=neutral, הכנסות=cyan, הוצאות=pink-purple
- Global background: deep navy gradient (cyan top → lavender hint)
- All screens (auth, onboarding, home) use transparent backgrounds over global gradient
- Header: frosted glass effect
- Transactions saved to correct month based on entry date
- Recurring rules: overdue detection, mark as paid / reschedule / delete rule
- Bottom sheet uses React Portal
- Transaction list: 160px bottom padding
- Amount input: 7 digit limit
- PWA installed on iPhone

## Known limitations ⚠️
- Numpad auto-focus not working on iOS Safari (deferred to EAS build)
- White bar at very bottom (iOS home indicator — resolves with EAS build)
- Recurring rules not projected to past months (deferred — Phase 2)

## Do NOT touch ⛔
- ScreenTransition.tsx
- All modal files
- SwipeableScreens.tsx

## Next steps (in order)
1. Screen 1 redesign — spending ring / visual layout overhaul
2. Export PDF + Excel
3. Hamburger menu — profile, settings (Phase 2)
4. EAS Build when Apple Developer account approved
