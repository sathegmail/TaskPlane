import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import App, { appStore } from '../App';

describe('TaskPlane UI Component & Interaction Tests', () => {
  beforeEach(() => {
    // Reset to logged out
    appStore.signOut();
  });

  test('Renders Google OAuth login gate initially', () => {
    const { getByText, getByTestId } = render(<App />);

    expect(getByText('Continue with Google')).toBeTruthy();
    expect(getByTestId('google-signin-primary')).toBeTruthy();
  });

  test('Signs in with Google and displays header, group switcher, and initial recurring task', () => {
    const { getByText, getAllByText, getByTestId } = render(<App />);

    // Click Google Sign In
    const googleBtn = getByTestId('google-signin-primary');
    fireEvent.press(googleBtn);

    // Brand and group header
    expect(getByText('TaskPlane')).toBeTruthy();
    expect(getAllByText('Family & Home').length).toBeGreaterThanOrEqual(1);

    // Recurring task with assignees
    expect(getByText('Empty Dishwasher')).toBeTruthy();
  });

  test('Simulates user quick-adding a new task', () => {
    const { getByTestId, getByText } = render(<App />);

    // Sign in first
    fireEvent.press(getByTestId('google-signin-primary'));

    const input = getByTestId('quick-add-input');
    const addButton = getByTestId('quick-add-button');

    // Type new task title
    fireEvent.changeText(input, 'Automated Polish Task');
    fireEvent.press(addButton);

    // Verify task is now visible on screen
    expect(getByText('Automated Polish Task')).toBeTruthy();
  });

  test('Simulates clicking a task to toggle completion', () => {
    const { getByText, getByTestId } = render(<App />);

    // Sign in first
    fireEvent.press(getByTestId('google-signin-primary'));

    const dishwasherTask = getByText('Empty Dishwasher');
    expect(dishwasherTask).toBeTruthy();

    const task = appStore.getState().tasks.find((t) => t.title === 'Empty Dishwasher');
    expect(task).toBeDefined();

    // Toggle completion
    act(() => {
      appStore.toggleTaskCompletion(task!.id);
    });
    const updated = appStore.getState().tasks.find((t) => t.id === task!.id);
    expect(updated?.is_completed).toBe(true);
  });
});
