# TaskPlane — Product Specification

**Version:** 2.2 (Recurring Tasks & Multi-Assignee Scheduling)  
**Status:** In Progress  
**Last Updated:** 2026-11-01  

---

## 1. Executive Summary

**TaskPlane** is a fast, cross-platform collaborative productivity system designed for phones, tablets, and smartwatches. 

Every task belongs to a **Group** and is allocated into a **Folder**. Groups support **Role-Based Access Control (RBAC)** and invitations via **Google OAuth**. Tasks support **multi-participant assignments** and **recurring schedules** (e.g., *"Every Monday, Empty Dishwasher, assigned to John and Sarah"*).

---

## 2. Target Platforms & Distribution

| Platform | Target Devices | Primary Experience | Distribution Channel |
| :--- | :--- | :--- | :--- |
| **iOS** | iPhone | Full App UI (Google Sign-In, Group switching, recurring task builder) | Apple App Store |
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
        └── Tasks (Belong to a Group + Folder; assigned to Participants)
            └── Recurrence Rule (e.g. Every Monday, Daily, Monthly)
```

---

## 4. Feature Specifications

### 4.1 Authentication & Google OAuth
- **One-Tap Google Sign-In**: Frictionless authentication on iOS, Android, and web without passwords.
- **Profile Synchronization**: Automatic sync of Google display name, verified email, and profile avatar.
- **Default Group**: Automatic creation of a personal workspace (*"My Space"*) on first login.

### 4.2 Group Administration & Google Email Invitations
- **Invite by Google Email**: Admin enters a Google email and configures starting permissions (`can_create_tasks`, `can_edit_tasks`, `can_manage_folders`, `can_participate`).
- **Auto-Redeem Onboarding**: When the invited user signs in with Google, they are automatically added to the group with their allocated folders and tasks.

### 4.3 Folders & Task Allocation
- Groups contain **Folders** (e.g., *"Chores"*, *"Sprint 1"*, *"Hardware Project"*).
- Tasks are allocated directly into these folders with priority badges (`Urgent`, `High`, `Medium`, `Low`).

### 4.4 Multi-Participant Assignment
- Tasks can be assigned to **one or multiple group members** (e.g., assigned to both John and Sarah).
- When a task is assigned to multiple users:
  - It appears in the **Today / Upcoming** view for all assigned members.
  - Smartwatch notifications trigger on **all** assigned members' wrists.
  - Any assigned member can mark it complete from their phone, tablet, or smartwatch.

### 4.5 Recurring Tasks Engine
- **Flexible Recurrence Patterns**:
  - **Daily**: Every day or every $N$ days.
  - **Weekly**: Specific days of the week (e.g., *Every Monday*, or *Monday, Wednesday, Friday*).
  - **Monthly**: Specific day of the month or weekday (e.g., *1st of every month*, *Last Friday of the month*).
  - **Custom intervals**: Every $N$ weeks / months.
- **Example Use Case**:
  > *"Every Monday at 8:00 AM, Empty Dishwasher, Folder: Home Chores, Assigned to: John & Sarah."*
- **Next Occurrence Auto-Scheduling**:
  - When John or Sarah marks the Monday dishwasher task complete, the current task records who completed it and when.
  - The recurrence engine automatically spawns/schedules the next instance for the following Monday, retaining the folder allocation and assignees.

### 4.6 Smartwatch Wrist Experience
- **Actionable Notifications**: Buzzes the wrists of all assigned members with interactive buttons (`[✓ Complete]` / `[⏰ Snooze 15m]`).
- **Dedicated Wrist App**: Shows today's recurring and one-off tasks assigned to the user.
