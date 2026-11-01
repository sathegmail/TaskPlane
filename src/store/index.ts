import {
  UserProfile,
  Group,
  GroupMember,
  GroupInvitation,
  Folder,
  Task,
  TaskPriority,
  RecurrenceRule,
} from '../types';
import { completeRecurringTask } from '../utils/recurrence';

export interface TaskStoreState {
  currentUser: UserProfile | null;
  groups: Group[];
  activeGroupId: string | null;
  members: GroupMember[];
  invitations: GroupInvitation[];
  folders: Folder[];
  tasks: Task[];
}

// Generate simple mock UUIDs for offline/local storage
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class TaskStore {
  private state: TaskStoreState;
  private listeners: Array<() => void> = [];

  constructor(initialState?: Partial<TaskStoreState>) {
    this.state = {
      currentUser: null,
      groups: [],
      activeGroupId: null,
      members: [],
      invitations: [],
      folders: [],
      tasks: [],
      ...initialState,
    };
  }

  public getState(): TaskStoreState {
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- User Profile & Authentication ---
  public setCurrentUser(user: UserProfile) {
    this.state.currentUser = user;
    // Auto-redeem any pending invitations for this user's Google email
    this.redeemPendingInvitations(user);
    // Auto-create default personal workspace if user has no groups
    const userGroups = this.getUserGroups(user.id);
    if (userGroups.length === 0) {
      const personalGroup = this.createGroup('Personal', 'Your private task workspace', user.id);
      this.state.activeGroupId = personalGroup.id;
    } else if (!this.state.activeGroupId) {
      this.state.activeGroupId = userGroups[0].id;
    }
    this.notify();
  }

  public signOut() {
    this.state.currentUser = null;
    this.state.activeGroupId = null;
    this.notify();
  }

  // --- Groups & Members ---
  public createGroup(name: string, description?: string, creatorUserId?: string): Group {
    const userId = creatorUserId || this.state.currentUser?.id;
    if (!userId) throw new Error('Cannot create group without authenticated user');

    const now = new Date().toISOString();
    const group: Group = {
      id: generateUUID(),
      name,
      description,
      created_by: userId,
      created_at: now,
      updated_at: now,
    };

    const adminMember: GroupMember = {
      id: generateUUID(),
      group_id: group.id,
      user_id: userId,
      role: 'admin',
      permissions: {
        can_create_tasks: true,
        can_edit_tasks: true,
        can_manage_folders: true,
        can_participate: true,
      },
      joined_at: now,
    };

    this.state.groups.push(group);
    this.state.members.push(adminMember);
    if (!this.state.activeGroupId) {
      this.state.activeGroupId = group.id;
    }
    this.notify();
    return group;
  }

  public setActiveGroup(groupId: string) {
    this.state.activeGroupId = groupId;
    this.notify();
  }

  public getUserGroups(userId: string): Group[] {
    const memberGroupIds = this.state.members
      .filter((m) => m.user_id === userId)
      .map((m) => m.group_id);
    return this.state.groups.filter((g) => memberGroupIds.includes(g.id));
  }

  public getMemberInGroup(groupId: string, userId: string): GroupMember | undefined {
    return this.state.members.find((m) => m.group_id === groupId && m.user_id === userId);
  }

  // --- Google OAuth Invitations ---
  public inviteMemberByEmail(
    groupId: string,
    invitedEmail: string,
    permissions = {
      can_create_tasks: true,
      can_edit_tasks: false,
      can_manage_folders: false,
      can_participate: true,
    }
  ): GroupInvitation {
    const currentUser = this.state.currentUser;
    if (!currentUser) throw new Error('Authentication required');

    const member = this.getMemberInGroup(groupId, currentUser.id);
    if (!member || member.role !== 'admin') {
      throw new Error('Only group administrators can invite members');
    }

    const invitation: GroupInvitation = {
      id: generateUUID(),
      group_id: groupId,
      invited_email: invitedEmail.toLowerCase().trim(),
      invited_by: currentUser.id,
      role: 'member',
      permissions,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    this.state.invitations.push(invitation);
    this.notify();
    return invitation;
  }

  public redeemPendingInvitations(user: UserProfile) {
    const pending = this.state.invitations.filter(
      (inv) => inv.invited_email === user.email.toLowerCase().trim() && inv.status === 'pending'
    );

    const now = new Date().toISOString();
    pending.forEach((inv) => {
      inv.status = 'accepted';
      this.state.members.push({
        id: generateUUID(),
        group_id: inv.group_id,
        user_id: user.id,
        role: inv.role,
        permissions: inv.permissions,
        joined_at: now,
      });
    });

    if (pending.length > 0) {
      this.notify();
    }
  }

  // --- Folders (Task Allocation) ---
  public createFolder(name: string, color?: string, icon?: string): Folder {
    const groupId = this.state.activeGroupId;
    const currentUser = this.state.currentUser;
    if (!groupId || !currentUser) throw new Error('Active group and authenticated user required');

    const member = this.getMemberInGroup(groupId, currentUser.id);
    if (!member || (!member.permissions.can_manage_folders && member.role !== 'admin')) {
      throw new Error('Permission denied: cannot manage folders');
    }

    const now = new Date().toISOString();
    const folder: Folder = {
      id: generateUUID(),
      group_id: groupId,
      name,
      color: color || '#6366F1',
      icon: icon || 'folder',
      created_by: currentUser.id,
      created_at: now,
      updated_at: now,
    };

    this.state.folders.push(folder);
    this.notify();
    return folder;
  }

  public getActiveGroupFolders(): Folder[] {
    if (!this.state.activeGroupId) return [];
    return this.state.folders.filter((f) => f.group_id === this.state.activeGroupId);
  }

  // --- Tasks & Recurrence ---
  public createTask(params: {
    title: string;
    notes?: string;
    folder_id?: string | null;
    due_date?: string;
    priority?: TaskPriority;
    assigned_to?: string[];
    recurrence?: RecurrenceRule | null;
  }): Task {
    const groupId = this.state.activeGroupId;
    const currentUser = this.state.currentUser;
    if (!groupId || !currentUser) throw new Error('Active group and user required to create task');

    const member = this.getMemberInGroup(groupId, currentUser.id);
    if (!member || (!member.permissions.can_create_tasks && member.role !== 'admin')) {
      throw new Error('Permission denied: cannot create tasks in this group');
    }

    const now = new Date().toISOString();
    const task: Task = {
      id: generateUUID(),
      group_id: groupId,
      folder_id: params.folder_id || null,
      title: params.title,
      notes: params.notes,
      due_date: params.due_date,
      priority: params.priority || 'medium',
      is_completed: false,
      created_by: currentUser.id,
      assigned_to: params.assigned_to || [currentUser.id],
      recurrence: params.recurrence || null,
      created_at: now,
      updated_at: now,
    };

    this.state.tasks.push(task);
    this.notify();
    return task;
  }

  public toggleTaskCompletion(taskId: string, userId?: string): { completedTask: Task; nextTask: Task | null } {
    const currentUserId = userId || this.state.currentUser?.id;
    if (!currentUserId) throw new Error('User identity required to complete task');

    const index = this.state.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) throw new Error('Task not found');

    const task = this.state.tasks[index];
    if (task.is_completed) {
      // Uncomplete
      const updated: Task = {
        ...task,
        is_completed: false,
        completed_at: undefined,
        completed_by: undefined,
        updated_at: new Date().toISOString(),
      };
      this.state.tasks[index] = updated;
      this.notify();
      return { completedTask: updated, nextTask: null };
    }

    // Complete with recurrence evaluation
    const { completedTask, nextTask } = completeRecurringTask(task, currentUserId, generateUUID);
    this.state.tasks[index] = completedTask;

    if (nextTask) {
      this.state.tasks.push(nextTask);
    }

    this.notify();
    return { completedTask, nextTask };
  }

  public getActiveGroupTasks(folderId?: string | null): Task[] {
    if (!this.state.activeGroupId) return [];
    let list = this.state.tasks.filter((t) => t.group_id === this.state.activeGroupId);
    if (folderId) {
      list = list.filter((t) => t.folder_id === folderId);
    }
    return list;
  }

  public getTasksAssignedToUser(userId: string): Task[] {
    return this.state.tasks.filter((t) => t.assigned_to.includes(userId));
  }
}
