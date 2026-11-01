# TaskPlane — Implementation Roadmap

**Tracking our development milestones from scratch to App Store / Play Store launch.**

---

## 📌 Phase 1: Project Scaffolding & Core Architecture
- [ ] Initialize Expo (React Native + TypeScript) project with modern navigation.
- [ ] Set up styling (Tailwind / NativeWind) with Dark/Light theme support.
- [ ] Set up TypeScript types & local storage layer (offline-ready).
- [ ] Commit & push initial structure to GitHub.

---

## 📌 Phase 2: Core Task Experience (Phone & Tablet)
- [ ] Build **Today View**: List of current day's tasks with priority badges.
- [ ] Build **Quick Add Task Modal/Screen**: Title, due date picker, priority selector, category tag.
- [ ] Build **Task Card**: Checkbox to toggle completion with smooth animation, edit, swipe to delete.
- [ ] Build **Tablet / iPad Responsive Layout**: Two-column view (sidebar lists + task panel).
- [ ] Verify live on mobile via Expo Go (scan QR code).

---

## 📌 Phase 3: Universal Smartwatch Notifications & Offline Sync
- [ ] Configure `expo-notifications` with actionable interactive categories (`Done` / `Snooze 15m`).
- [ ] Test notification actions on connected smartwatches (Apple Watch / Garmin / Wear OS).
- [ ] Integrate Supabase client for cloud backup and real-time multi-device sync.

---

## 📌 Phase 4: Dedicated Wrist Companions & Polish
- [ ] Add Apple Watch (SwiftUI) companion target in Xcode prebuild.
- [ ] Add Wear OS (Compose) companion module in Android project.
- [ ] App store icon, splash screen, and metadata preparation.
- [ ] Publish to TestFlight (iOS) and Google Play Internal Testing.
