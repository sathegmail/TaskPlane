# TaskPlane — System Architecture

**Version:** 2.1 (Google OAuth & Member Invitations)  
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

### 2.6 `Task` Entity
```typescript
interface Task {
  id: string;
  group_id: string;           // Foreign Key -> Group.id (Mandatory)
  folder_id?: string | null;  // Foreign Key -> Folder.id (Optional: Allocated into a folder)
  title: string;              // Task summary
  notes?: string;             // Detailed description
  due_date?: string;          // ISO 8601 string
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_completed: boolean;
  completed_at?: string;
  created_by: string;         // User ID of creator
  assigned_to: string[];      // Array of User IDs (Group members participating)
  created_at: string;
  updated_at: string;
}
```

---

## 3. Google OAuth Flow & Invitation Redemption

1. **Invite Generation**:
   - Admin enters `invitee@gmail.com` and sets permissions.
   - Record created in `GroupInvitation` table with `status: 'pending'`.
2. **Google Sign-In**:
   - Invitee signs in with Google OAuth (`@react-native-google-signin/google-signin` or Supabase Google OAuth).
   - Authenticated JWT confirms `email: "invitee@gmail.com"`.
3. **Automatic Association Hook (Supabase Postgres Trigger)**:
   - When a user signs in, a trigger queries `GroupInvitation` for matching `invited_email`.
   - Matching pending invitations are automatically inserted into `GroupMember` with the specified permissions, and `GroupInvitation.status` is set to `'accepted'`.
   - The user immediately gains access to the group, its folders, and its tasks on all their devices!
