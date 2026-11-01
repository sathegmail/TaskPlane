# TaskPlane — System Architecture

**Version:** 2.0 (Groups, Folders & Permissions)  
**Last Updated:** 2026-11-01  

---

## 1. System Overview

```
                                  ┌───────────────────────────┐
                                  │   Supabase Cloud DB       │
                                  │   (Postgres, RLS, Auth)   │
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

### 2.1 `Group` Entity
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

### 2.2 `GroupMember` & Permissions Entity (RBAC)
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
  user_id: string;            // Foreign Key -> User.id
  role: GroupRole;            // 'admin' has all permissions by default
  permissions: GroupPermissions;
  joined_at: string;
}
```

### 2.3 `Folder` Entity
```typescript
interface Folder {
  id: string;
  group_id: string;           // Foreign Key -> Group.id (Every folder belongs to a group)
  name: string;               // e.g. "Sprint 14", "House Chores"
  color?: string;             // Hex code (e.g. "#6366F1")
  icon?: string;              // e.g. "folder", "briefcase", "home"
  created_by: string;         // User ID of creator
  created_at: string;
  updated_at: string;
}
```

### 2.4 `Task` Entity
```typescript
interface Task {
  id: string;
  group_id: string;           // Foreign Key -> Group.id (Mandatory: Every task belongs to a group)
  folder_id?: string | null;  // Foreign Key -> Folder.id (Optional: Allocated into a folder)
  title: string;              // Task summary
  notes?: string;             // Detailed description / checklist
  due_date?: string;          // ISO 8601 string
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_completed: boolean;
  completed_at?: string;
  created_by: string;         // User ID of creator
  assigned_to: string[];      // Array of User IDs (Group members participating in task)
  created_at: string;
  updated_at: string;
}
```

---

## 3. Row-Level Security (RLS) on Cloud Database

Supabase provides PostgreSQL Row-Level Security (RLS) policies to enforce permissions at the database level:
- **Group Isolation**: A user can only read/write data for groups where they are an active `GroupMember`.
- **Admin Rights**: Only users with `role: 'admin'` or `permissions.can_manage_folders` can create/delete folders.
- **Task Permissions**: Creating tasks checks `permissions.can_create_tasks`; editing checks `permissions.can_edit_tasks` or if the user is the task creator/assignee.
