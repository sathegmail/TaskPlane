# TaskPlane — Product Specification

**Version:** 2.1 (Google OAuth & Member Invitations)  
**Status:** In Progress  
**Last Updated:** 2026-11-01  

---

## 1. Executive Summary

**TaskPlane** is a fast, cross-platform collaborative productivity system designed for phones, tablets, and smartwatches. 

Every task belongs to a **Group** (Workspace/Team). Groups are organized into **Folders**, and group administrators manage member permissions. **Authentication and member invitations are powered by Google OAuth**, enabling frictionless one-tap sign-ins and instant group joining by Google email.

---

## 2. Target Platforms & Distribution

| Platform | Target Devices | Primary Experience | Distribution Channel |
| :--- | :--- | :--- | :--- |
| **iOS** | iPhone | Full App UI (Google Sign-In, Group switching, folder nav, quick add) | Apple App Store |
| **iPadOS** | iPad | Adaptive 3-Column UI (Groups & Folders sidebar + Tasks + Details) | Apple App Store |
| **Android** | All Android Phones & Tablets | Full App UI (Native Google One-Tap Sign-In) | Google Play Store |
| **watchOS** | Apple Watch (Series 4+) | Assigned tasks checklist, group filter, complications | Apple App Store |
| **Wear OS** | Galaxy Watch, Pixel Watch, OnePlus | Assigned tasks checklist, quick tiles | Google Play Store |
| **All Other Smartwatches** | Garmin, Fitbit, Amazfit, etc. | Actionable Wrist Notifications (Done / Snooze) | Handled automatically via Bluetooth |

---

## 3. Structural Hierarchy

```
Google Account (OAuth 2.0)
└── User Profile (email, name, avatar)
    └── Groups (Every user belongs to 1 or more groups)
        ├── Administrator (Creator by default; manages permissions & invites)
        ├── Pending Invitations (Tracked by Google email)
        ├── Members (Configured with granular access rights)
        ├── Folders (Sub-containers for allocating related tasks)
        └── Tasks (Belong to a Group + optional Folder; assigned to Participants)
```

---

## 4. Feature Specifications

### 4.1 Authentication & Google OAuth
- **One-Tap Google Sign-In**: Users sign in seamlessly with their Google account on iOS, Android, and web without needing passwords.
- **Profile Synchronization**: Automatic sync of Google display name, verified email, and profile avatar.
- **Default Group Creation**: On first Google sign-in, the system automatically creates their personal default workspace (*"My Space"*).

### 4.2 Group Administration & Google Email Invitations
- **Invite via Google Email**:
  - An Admin inputs a collaborator's Google email (e.g., `teammate@gmail.com`).
  - The Admin configures their starting permissions (`can_create_tasks`, `can_edit_tasks`, `can_manage_folders`, `can_participate`).
  - An invitation token and pending `GroupInvitation` record is generated.
- **Frictionless Onboarding**:
  - When the invitee opens TaskPlane and authenticates with that Google account, the app automatically accepts the pending invitation and adds them to the group with their pre-assigned permissions.
  - If the user is already logged in, the group immediately appears in their group switcher via real-time sync.

### 4.3 Granular Member Permissions (RBAC)
- `can_create_tasks`: Ability to create new tasks in the group.
- `can_edit_tasks`: Ability to edit or delete tasks.
- `can_manage_folders`: Ability to create, rename, or delete folders.
- `can_participate`: Ability to be assigned to tasks and check off assigned tasks.

### 4.4 Folders (Task Allocation)
- Each group can create multiple **Folders** to allocate work (e.g., *"Sprint 1"*, *"Marketing"*, *"Chores"*).
- Tasks are entered directly into folders or live at the group root level.
- Folders feature customizable color badges and icons.

### 4.5 Task Lifecycle & Wrist Sync
- **Task Fields**: Title, description, folder reference, due date/time, priority, status.
- **Assignees / Participants**: Tasks can be assigned to one or more members of the group.
- **Wrist Sync**: Assigned tasks sync directly to the user's smartwatches with interactive `[✓ Complete]` and `[⏰ Snooze]` notifications.
