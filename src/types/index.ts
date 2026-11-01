// TaskPlane Core Domain Entities & TypeScript Models

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
}

export type GroupRole = 'admin' | 'member';

export interface GroupPermissions {
  can_create_tasks: boolean;
  can_edit_tasks: boolean;
  can_manage_folders: boolean;
  can_participate: boolean;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string; // User ID
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupRole;
  permissions: GroupPermissions;
  joined_at: string;
}

export interface GroupInvitation {
  id: string;
  group_id: string;
  invited_email: string;
  invited_by: string;
  role: GroupRole;
  permissions: GroupPermissions;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export interface Folder {
  id: string;
  group_id: string;
  name: string;
  color?: string;
  icon?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';
export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number; // e.g. 1 = every week, 2 = every 2 weeks
  days_of_week?: DayOfWeek[]; // e.g. ['mon'] for "Every Monday"
  time_of_day?: string; // e.g. "08:00"
  end_date?: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  group_id: string;
  folder_id?: string | null;
  title: string;
  notes?: string;
  due_date?: string; // ISO 8601
  priority: TaskPriority;
  is_completed: boolean;
  completed_at?: string;
  completed_by?: string;
  created_by: string;
  assigned_to: string[]; // User IDs of group members
  recurrence?: RecurrenceRule | null;
  parent_recurrence_id?: string;
  created_at: string;
  updated_at: string;
}
