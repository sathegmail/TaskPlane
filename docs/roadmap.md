# TaskPlane — Implementation Roadmap

**Tracking our development milestones from scratch to App Store / Play Store launch.**
*All phases follow the strict Agent-Led Automated Testing Protocol ([docs/testing.md](file:///Users/Aarav/Documents/Apps/TaskPlane/docs/testing.md)).*

---

## 📌 Phase 1: Project Scaffolding & Automated Test Harness
- [ ] Initialize Expo (React Native + TypeScript) project with modern navigation.
- [ ] Install & configure **Jest** + **React Native Testing Library**.
- [ ] Define TypeScript schemas for `UserProfile`, `Group`, `GroupMember`, `GroupInvitation`, `Folder`, `RecurrenceRule`, and `Task`.
- [ ] Build & test local store engine (SQLite / in-memory cache) with group, folder, and recurrence calculations.
- [ ] Verify scaffolding passes 100% automated tests & headless bundle compilation.
- [ ] Commit & push to GitHub.

---

## 📌 Phase 2: Groups, Folders, Recurring Tasks & Collaborative UI
- [ ] **Google Sign-In UI & Profile State**:
  - Google OAuth login flow (mock/dev provider + Supabase Google Auth).
  - Profile avatar, display name, and active session management.
- [ ] **Group Switcher & Admin Controls**:
  - Group dropdown/selector (switch between Work, Personal, etc.).
  - Admin member management screen (invite via Google email, configure permissions).
- [ ] **Folder Management (Allocation)**:
  - Create / rename folders inside the active group.
  - Filter tasks by folder.
- [ ] **Task Creation & Multi-Assignee Allocation**:
  - Quick Add Task with folder picker and multi-member selector (e.g. John + Sarah).
  - Recurrence Builder: e.g. "Every Monday", daily, custom intervals.
  - Interactive Task List (checkbox, priority indicators, swipe to delete).
- [ ] **Recurrence Engine**:
  - Auto-generate next occurrence upon completion while logging `completed_by`.
- [ ] **Adaptive Layout**:
  - 3-column tablet / iPad layout (Groups & Folders sidebar + Task List + Task Details).
  - Clean single-screen mobile navigation.
- [ ] **Agent Test Suite**: 100% automated tests for group switching, recurrence calculation (next Monday test), multi-assignee completion, and folder allocation.

---

## 📌 Phase 3: Smartwatch Sync & Multi-User Realtime
- [ ] Configure `expo-notifications` for assigned task alerts with `Done` and `Snooze` actions.
- [ ] Connect Supabase Realtime so changes made by one group member update live on other members' devices.
- [ ] **Agent Test**: Multi-user permissions and notification trigger simulations.

---

## 📌 Phase 4: Dedicated Wrist Targets & Store Publishing
- [ ] Add Apple Watch (SwiftUI) companion target.
- [ ] Add Wear OS companion module.
- [ ] Assets, icons, and Play Store / App Store metadata.
- [ ] Final end-to-end regression test suite.
