import { TaskStore } from '../src/store';
import { UserProfile } from '../src/types';

describe('TaskPlane Store & Domain Logic', () => {
  let store: TaskStore;

  const userAarav: UserProfile = {
    id: 'user-aarav-1',
    email: 'aarav@gmail.com',
    full_name: 'Aarav Sathe',
    created_at: new Date().toISOString(),
  };

  const userJohn: UserProfile = {
    id: 'user-john-2',
    email: 'john@gmail.com',
    full_name: 'John Doe',
    created_at: new Date().toISOString(),
  };

  const userSarah: UserProfile = {
    id: 'user-sarah-3',
    email: 'sarah@gmail.com',
    full_name: 'Sarah Smith',
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    store = new TaskStore();
  });

  test('User login auto-creates default Personal workspace if none exists', () => {
    store.setCurrentUser(userAarav);
    const state = store.getState();

    expect(state.groups).toHaveLength(1);
    expect(state.groups[0].name).toBe('Personal');
    expect(state.groups[0].created_by).toBe(userAarav.id);
    expect(state.activeGroupId).toBe(state.groups[0].id);

    const member = store.getMemberInGroup(state.groups[0].id, userAarav.id);
    expect(member).toBeDefined();
    expect(member?.role).toBe('admin');
  });

  test('Admin creates a group, creates folders, and allocates tasks into folders', () => {
    store.setCurrentUser(userAarav);
    const homeGroup = store.createGroup('Home & Chores', 'Shared family chores');
    store.setActiveGroup(homeGroup.id);

    // Create a folder inside Home & Chores
    const kitchenFolder = store.createFolder('Kitchen', '#10B981', 'utensils');
    expect(store.getActiveGroupFolders()).toHaveLength(1);
    expect(kitchenFolder.group_id).toBe(homeGroup.id);

    // Create a task allocated to the Kitchen folder
    const task = store.createTask({
      title: 'Wipe countertops',
      folder_id: kitchenFolder.id,
      priority: 'high',
    });

    expect(task.group_id).toBe(homeGroup.id);
    expect(task.folder_id).toBe(kitchenFolder.id);

    const folderTasks = store.getActiveGroupTasks(kitchenFolder.id);
    expect(folderTasks).toHaveLength(1);
    expect(folderTasks[0].title).toBe('Wipe countertops');
  });

  test('Admin invites user via Google email and auto-redeems permissions upon sign-in', () => {
    store.setCurrentUser(userAarav);
    const teamGroup = store.createGroup('Product Engineering');
    store.setActiveGroup(teamGroup.id);

    // Aarav invites Sarah by Google email
    const invitation = store.inviteMemberByEmail(teamGroup.id, 'sarah@gmail.com', {
      can_create_tasks: true,
      can_edit_tasks: false,
      can_manage_folders: false,
      can_participate: true,
    });

    expect(invitation.status).toBe('pending');
    expect(invitation.invited_email).toBe('sarah@gmail.com');

    // Sarah signs in with Google
    store.redeemPendingInvitations(userSarah);

    const sarahMember = store.getMemberInGroup(teamGroup.id, userSarah.id);
    expect(sarahMember).toBeDefined();
    expect(sarahMember?.role).toBe('member');
    expect(sarahMember?.permissions.can_create_tasks).toBe(true);
    expect(sarahMember?.permissions.can_manage_folders).toBe(false);
  });

  test('Permission gating: member without folder management permission is blocked from creating folders', () => {
    store.setCurrentUser(userAarav);
    const teamGroup = store.createGroup('Ops Team');
    store.setActiveGroup(teamGroup.id);

    store.inviteMemberByEmail(teamGroup.id, 'john@gmail.com', {
      can_create_tasks: true,
      can_edit_tasks: false,
      can_manage_folders: false,
      can_participate: true,
    });
    store.redeemPendingInvitations(userJohn);

    // Switch current user to John
    store.setCurrentUser(userJohn);
    store.setActiveGroup(teamGroup.id);

    // John attempts to create a folder -> should throw permission error
    expect(() => {
      store.createFolder('Restricted Folder');
    }).toThrow('Permission denied: cannot manage folders');
  });

  test('Recurring Task: Every Monday dishwasher assigned to John & Sarah auto-schedules next occurrence upon completion', () => {
    store.setCurrentUser(userAarav);
    const familyGroup = store.createGroup('Family Residence');
    store.setActiveGroup(familyGroup.id);

    const choresFolder = store.createFolder('Chores', '#3B82F6');

    // Monday, Nov 2, 2026 at 08:00 AM
    const mondayDue = new Date(2026, 10, 2, 8, 0, 0);

    const recurringTask = store.createTask({
      title: 'Empty Dishwasher',
      folder_id: choresFolder.id,
      due_date: mondayDue.toISOString(),
      priority: 'medium',
      assigned_to: [userJohn.id, userSarah.id],
      recurrence: {
        frequency: 'weekly',
        interval: 1,
        days_of_week: ['mon'],
        time_of_day: '08:00',
      },
    });

    expect(recurringTask.assigned_to).toEqual([userJohn.id, userSarah.id]);
    expect(recurringTask.folder_id).toBe(choresFolder.id);

    // Sarah completes the task
    const { completedTask, nextTask } = store.toggleTaskCompletion(recurringTask.id, userSarah.id);

    // Verify current task is marked done by Sarah
    expect(completedTask.is_completed).toBe(true);
    expect(completedTask.completed_by).toBe(userSarah.id);
    expect(completedTask.completed_at).toBeDefined();

    // Verify next task is scheduled
    expect(nextTask).toBeDefined();
    expect(nextTask?.is_completed).toBe(false);
    expect(nextTask?.title).toBe('Empty Dishwasher');
    expect(nextTask?.folder_id).toBe(choresFolder.id);
    expect(nextTask?.assigned_to).toEqual([userJohn.id, userSarah.id]);

    // Next task due date should be next Monday (Nov 9, 2026 at 08:00 AM)
    const nextDate = new Date(nextTask!.due_date!);
    expect(nextDate.getDay()).toBe(1); // Monday is day 1
    expect(nextDate.getDate()).toBe(9);
    expect(nextDate.getHours()).toBe(8);
  });
});
