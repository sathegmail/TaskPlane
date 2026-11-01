# TaskPlane — Product Specification

**Version:** 2.0 (Group Collaboration & RBAC)  
**Status:** In Progress  
**Last Updated:** 2026-11-01  

---

## 1. Executive Summary

**TaskPlane** is a fast, modern, cross-platform collaborative productivity system designed for phones, tablets, and smartwatches. 

Every task in TaskPlane belongs to a **Group** (Workspace/Team). Groups are organized into **Folders**, and group administrators manage member permissions to create, modify, allocate, or participate in tasks.

---

## 2. Target Platforms & Distribution

| Platform | Target Devices | Primary Experience | Distribution Channel |
| :--- | :--- | :--- | :--- |
| **iOS** | iPhone | Full App UI (Group switching, folder nav, quick add) | Apple App Store |
| **iPadOS** | iPad | Adaptive 3-Column UI (Groups & Folders sidebar + Tasks + Details) | Apple App Store |
| **Android** | All Android Phones & Tablets | Full App UI | Google Play Store |
| **watchOS** | Apple Watch (Series 4+) | Assigned tasks checklist, group filter, complications | Apple App Store |
| **Wear OS** | Galaxy Watch, Pixel Watch, OnePlus | Assigned tasks checklist, quick tiles | Google Play Store |
| **All Other Smartwatches** | Garmin, Fitbit, Amazfit, etc. | Actionable Wrist Notifications (Done / Snooze) | Handled automatically via Bluetooth |

---

## 3. Structural Hierarchy

```
User
└── Groups (Every user belongs to 1 or more groups)
    ├── Administrator (Creator by default; manages permissions)
    ├── Members (Configured with granular access rights)
    ├── Folders (Sub-containers for allocating related tasks)
    └── Tasks (Belong to a Group + optional Folder; assigned to Participants)
```

---

## 4. Feature Specifications

### 4.1 Groups & Multi-Tenancy
- **Default Group**: Upon registration, each user gets a private group (e.g. *"Personal"* or *"My Space"*).
- **Group Creation**: Any user can create new groups (e.g., *"TaskPlane Team"*, *"Family"*).
- **Group Switching**: A switcher at the top of the UI lets users instantly filter their view to a specific group or view *"All Assigned to Me"*.

### 4.2 Group Administration & Permissions (RBAC)
- **Administrator Role**:
  - The creator of a group is its primary Administrator.
  - Admins can invite new members via email or invite code.
  - Admins can grant or revoke Admin status to other members.
- **Granular Member Permissions**:
  Admins can customize each member's capabilities:
  - `can_create_tasks`: Ability to create new tasks in the group.
  - `can_edit_tasks`: Ability to edit/delete any task in the group.
  - `can_manage_folders`: Ability to create, rename, or delete folders.
  - `can_participate`: Ability to be assigned to tasks and check off assigned tasks.

### 4.3 Folders (Task Allocation)
- Each group can create multiple **Folders** to organize work into projects, sprints, or departments (e.g., *"Bug Tracker"*, *"Sprint 1"*, *"Groceries"*).
- Tasks are allocated directly into these folders.
- Folders feature customizable color badges and icons for glanceability.

### 4.4 Task Lifecycle & Participation
- **Task Fields**: Title, description/notes, folder reference, due date/time, priority, status.
- **Assignees / Participants**: Tasks can be assigned to one or more members of the group.
- **Wrist Sync**: If a task is assigned to a user, it syncs to their smartwatches and triggers their wrist notifications.

### 4.5 Synchronization & Offline
- **Local-First**: All group data is cached locally in SQLite for instant offline access.
- **Real-Time Group Sync**: When any member creates, moves, or completes a task, the change propagates in real-time to all group members' devices via Supabase.
