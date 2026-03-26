# Finly Current Status

## Branch: home-redesign
## Last updated: March 26, 2026

## What works ✅
- Auth: Firebase Google + Email/Password
- Onboarding: complete (name, gender, household, goals, welcome, success)
- Screen transitions: fade for auth/onboarding, slide for app screens (RTL)
- Home: 3 swipeable screens (swipe right = next, RTL correct)
  - Screen 1: balance card + Finly insight card (swipeable internally, no screen change)
  - Screen 2: overdue confirmation card + summary cards (income/expense) + empty state
  - Screen 3: transaction list with filters, bottom sheet on tap (edit/delete/mark as paid)
- PillBar: fixed bottom bar with הכנסה / Sparkles (home) / הוצאה — replaces FAB
- Month carousel in header (tap to change month)
- Add transaction: numpad (7 digit limit) + details flow
- Transactions saved to correct month based on entry date (not selected month)
- Delete searches all months by entry id
- Recurring rules: projected forward, overdue detection, mark as paid / reschedule / delete rule
- Bottom sheet uses React Portal (not clipped by SwipeableScreens)
- Transaction list: 160px bottom padding, last row visible above PillBar
- PWA installed on iPhone

## Known limitations ⚠️
- Numpad auto-focus not working on iOS Safari (deferred to EAS build)
- White bar at very bottom (iOS home indicator — resolves with EAS build)
- Recurring rules not projected to future months when entry date is in the past (deferred — will rebuild with Open Banking in Phase 2)

## Do NOT touch ⛔
- ScreenTransition.tsx (complex, working perfectly)
- All auth screens (complete)
- All onboarding screens (complete)
- All modal files (working)
- SwipeableScreens.tsx (sensitive, working)

## Next steps (in order)
1. Screen 1 redesign — spending ring / visual layout overhaul
2. MonthCarousel — fix swipe direction + smooth animation
3. Export PDF + Excel (Step B)
4. Hamburger menu — profile, settings (Phase 2)
5. EAS Build when Apple Developer account approved
