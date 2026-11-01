import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import App, { appStore } from '../App';

describe('Phase 2: Collaborative Workspaces, Folders & Task Modals', () => {
  beforeEach(() => {
    appStore.signOut();
  });

  test('Admin invites collaborator via Google email modal', () => {
    const { getByTestId } = render(<App />);

    // Sign in with Google as admin (Aarav)
    fireEvent.press(getByTestId('google-signin-primary'));

    // Open invite modal
    const inviteBtn = getByTestId('invite-collaborator-btn');
    fireEvent.press(inviteBtn);

    // Enter Google email
    const emailInput = getByTestId('invite-email-input');
    fireEvent.changeText(emailInput, 'partner@gmail.com');

    // Send invite
    const sendBtn = getByTestId('send-invite-button');
    fireEvent.press(sendBtn);

    // Check store for the pending invite
    const invites = appStore.getState().invitations;
    const match = invites.find((inv) => inv.invited_email === 'partner@gmail.com');
    expect(match).toBeDefined();
    expect(match?.status).toBe('pending');
    expect(match?.role).toBe('member');
  });

  test('Creates a new task folder via modal and allocates tasks to it', () => {
    const { getByTestId, getByText } = render(<App />);

    // Sign in with Google
    fireEvent.press(getByTestId('google-signin-primary'));

    // Open folder modal
    const newFolderBtn = getByTestId('new-folder-modal-btn');
    fireEvent.press(newFolderBtn);

    // Enter folder name
    const folderInput = getByTestId('folder-name-input');
    fireEvent.changeText(folderInput, 'Sprint Alpha');

    // Submit folder
    const createBtn = getByTestId('create-folder-button');
    fireEvent.press(createBtn);

    // Verify folder is in store and visible
    const folders = appStore.getActiveGroupFolders();
    const createdFolder = folders.find((f) => f.name === 'Sprint Alpha');
    expect(createdFolder).toBeDefined();
    expect(getByText(/Sprint Alpha/)).toBeTruthy();
  });

  test('Creates a detailed task with multi-assignees and weekly recurrence via TaskModal', () => {
    const { getByTestId } = render(<App />);

    // Sign in with Google
    fireEvent.press(getByTestId('google-signin-primary'));

    // Open Task Modal
    const openBtn = getByTestId('open-task-modal-btn');
    fireEvent.press(openBtn);

    // Enter title
    const titleInput = getByTestId('task-modal-title-input');
    fireEvent.changeText(titleInput, 'Weekly Architecture Review');

    // Select assignees
    const assigneeJohn = getByTestId('assignee-John Doe');
    const assigneeSarah = getByTestId('assignee-Sarah Smith');
    fireEvent.press(assigneeJohn);
    fireEvent.press(assigneeSarah);

    // Toggle recurrence
    const recToggle = getByTestId('recurrence-toggle-btn');
    fireEvent.press(recToggle);

    // Confirm creation
    const confirmBtn = getByTestId('create-task-confirm-btn');
    fireEvent.press(confirmBtn);

    // Verify task is created with multiple assignees and recurrence
    const created = appStore.getState().tasks.find((t) => t.title === 'Weekly Architecture Review');
    expect(created).toBeDefined();
    expect(created?.assigned_to).toEqual(expect.arrayContaining(['John Doe', 'Sarah Smith']));
    expect(created?.recurrence).toBeDefined();
    expect(created?.recurrence?.frequency).toBe('weekly');
  });

  test('Creates a new group workspace', () => {
    const { getByTestId } = render(<App />);

    // Sign in with Google
    fireEvent.press(getByTestId('google-signin-primary'));

    const newGroupBtn = getByTestId('new-group-btn');
    const prevCount = appStore.getState().groups.length;

    fireEvent.press(newGroupBtn);
    expect(appStore.getState().groups.length).toBe(prevCount + 1);
  });
});
