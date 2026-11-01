# TaskPlane — System Architecture

**Version:** 2.2 (Recurring Tasks & Multi-Assignee Scheduling)  
**Last Updated:** 2026-11-01  

---

## 1. System Overview

```
                                  ┌───────────────────────────┐
                                  │    Google Identity /      │
                                  │     OAuth 2.0 Provider    │
                                  └─────────────┬─────────────┘
                                                │ OAuth Token Exchange
                                                ▼
                                  ┌───────────────────────────┐
                                  │   Supabase Cloud DB       │
                                  │   (Auth, Postgres, RLS)   │
                                  └─────────────┬─────────────┘
                                                │ Realtime TLS
              ┌─────────────────────────────────┼─────────────────────────────────┐
              ▼                                 ▼                                 ▼
    ┌───────────────────┐             ┌───────────────────┐             ┌───────────────────┐
    │    iOS & iPadOS   │             │      Android      │             │    Apple Watch    │
    │  (Expo / React)   │             │  (Expo / React)   │             │ (SwiftUI WatchKit)│
    └─────────┬─────────┘             └─────────┬─────────┘             └─────────▲─────────┘
              │                                 │                                 │
              ▼                                 ▼                                 │
    ┌───────────────────┐             ┌───────────────────┐                       │
    │   Expo Local DB   │             │   Expo Local DB   │                       │
    │ (SQLite / MMKV)   │             │ (SQLite / MMKV)   │                       │
    └─────────┬─────────┘             └───────────────────┘                       │
              │                                                                   │
              └─────────────── WatchConnectivity Session ─────────────────────────┘
```

---

## 2. Relational Data Models & TypeScript Types

### 2.1 `User` Entity (Google Synced)
```typescript
interface UserProfile {
  id: string;                 // Supabase Auth UUID (mapped to Google sub)
  email: string;              // Verified Google email
  full_name: string;          // Google profile display name
  avatar_url?: string;        // Google profile photo URL
  created_at: string;
}
```

### 2.2 `Group` Entity
```typescript
interface Group {
  id: string;                 // UUID
  name: string;               // e.g. "Product Engineering", "Family"
  description?: string;
  created_by: string;         // User ID of the primary administrator
  created_at: string;         // ISO 8601
  updated_at: string;
}
```

### 2.3 `GroupMember` & Permissions Entity (RBAC)
```typescript
type GroupRole = 'admin' | 'member';

interface GroupPermissions {
  can_create_tasks: boolean;
  can_edit_tasks: boolean;
  can_manage_folders: boolean;
  can_participate: boolean;
}

interface GroupMember {
  id: string;
  group_id: string;           // Foreign Key -> Group.id
  user_id: string;            // Foreign Key -> UserProfile.id
  role: GroupRole;            // 'admin' has all permissions by default
  permissions: GroupPermissions;
  joined_at: string;
}
```

### 2.4 `GroupInvitation` Entity (Google OAuth Linkage)
```typescript
interface GroupInvitation {
  id: string;
  group_id: string;           // Foreign Key -> Group.id
  invited_email: string;      // The invitee's Google email address
  invited_by: string;         // Admin user ID
  role: GroupRole;
  permissions: GroupPermissions;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}
```

### 2.5 `Folder` Entity
```typescript
interface Folder {
  id: string;
  group_id: string;           // Foreign Key -> Group.id
  name: string;               // e.g. "Sprint 14", "House Chores"
  color?: string;             // Hex code (e.g. "#6366F1")
  icon?: string;              // e.g. "folder", "briefcase", "home"
  created_by: string;         // User ID of creator
  created_at: string;
  updated_at: string;
}
```

### 2.6 `RecurrenceRule` & `Task` Entities
```typescript
type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';
type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;                  // e.g. 1 = every week, 2 = every 2 weeks
  days_of_week?: DayOfWeek[];        // e.g. ['mon'] for "Every Monday"
  time_of_day?: string;              // "08:00"
  end_date?: string;                 // Optional expiration date
}

interface Task {
  id: string;
  group_id: string;                  // Foreign Key -> Group.id (Mandatory)
  folder_id?: string | null;         // Foreign Key -> Folder.id (Optional: Allocated into a folder)
  title: string;                     // e.g. "Empty Dishwasher"
  notes?: string;                    // Detailed instructions
  due_date?: string;                 // ISO 8601 string (e.g. 2026-11-02T08:00:00Z)
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_completed: boolean;
  completed_at?: string;             // Timestamp when checked off
  completed_by?: string;             // User ID of who checked it off (e.g. Sarah)
  created_by: string;                // User ID of creator
  assigned_to: string[];             // Array of User IDs (e.g. [John.id, Sarah.id])
  recurrence?: RecurrenceRule | null;// Recurrence definition
  parent_recurrence_id?: string;     // References the parent recurring template
  created_at: string;
  updated_at: string;
}
```

---

## 3. Recurrence Engine & Next-Occurrence Generation

When a task has a `recurrence` rule:
1. **Completion Trigger**:
   - Any assigned user (e.g., Sarah) marks the task complete on phone, tablet, or smartwatch.
   - The task is updated: `is_completed: true`, `completed_by: Sarah.id`, `completed_at: now()`.
2. **Next-Occurrence Calculation**:
   - The recurrence engine calculates the next scheduled date (e.g., the following Monday at 08:00 AM).
   - A new instance is created preserving:
     - `title`, `notes`, `priority`
     - `group_id`, `folder_id` (preserves folder allocation)
     - `assigned_to` (`[John.id, Sarah.id]`)
     - `recurrence` rule and `parent_recurrence_id`
   - The new occurrence is saved and immediately synced to all participants' devices.
