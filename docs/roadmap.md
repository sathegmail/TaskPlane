# TaskPlane — Implementation Roadmap

**Tracking our development milestones from scratch to App Store / Play Store launch.**
*All phases follow the strict Agent-Led Automated Testing Protocol ([docs/testing.md](file:///Users/Aarav/Documents/Apps/TaskPlane/docs/testing.md)).*

---

## 📌 Phase 1: Project Scaffolding & Automated Test Harness
- [ ] Initialize Expo (React Native + TypeScript) project.
- [ ] Install & configure **Jest** + **React Native Testing Library**.
- [ ] Configure `test:all` script (`tsc --noEmit` + `jest`).
- [ ] Set up styling (NativeWind / Tailwind) with responsive layouts.
- [ ] Verify scaffolding passes 100% of automated tests & headless bundle compilation.
- [ ] Commit & push to GitHub.

---

## 📌 Phase 2: Core Task Engine & Verified UI (Phone + Tablet)
- [ ] Build Task Data Store (offline persistence with SQLite / MMKV).
- [ ] **Agent Test**: Automated unit tests for create, update, delete, priority sort, and date filters.
- [ ] Build UI Components:
  - Header & Stats (total, completed, pending).
  - Quick Add Task Input bar.
  - Interactive Task List with completion toggle and delete swipe.
  - Filter tabs (All, Today, Priority, Done).
- [ ] **Agent Test**: Component simulation tests for typing, adding, checking off, and filtering.
- [ ] Build Responsive Layout for iPad / Tablet / Desktop.
- [ ] Verify test suite passes 100% before handing over for user visual check.

---

## 📌 Phase 3: Universal Smartwatch Notifications & Cloud Sync
- [ ] Configure `expo-notifications` with wrist actions (`ACTION_COMPLETE`, `ACTION_SNOOZE`).
- [ ] **Agent Test**: Simulated notification trigger & background completion tests.
- [ ] Set up Supabase client for multi-device sync with offline fallback.
- [ ] **Agent Test**: Offline-to-online sync reconciliation tests.

---

## 📌 Phase 4: Dedicated Wrist Companions & Store Prep
- [ ] Add Apple Watch (SwiftUI) companion target.
- [ ] Add Wear OS companion module.
- [ ] Full app store assets (icons, splash screens).
- [ ] Final end-to-end automated regression run.
