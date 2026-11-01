import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TaskStore } from './src/store';
import { Task, Folder, TaskPriority } from './src/types';

// Initialize singleton store for the app session
export const appStore = new TaskStore();

// Bootstrap initial seed data so the app is immediately alive
const defaultUser = {
  id: 'user-aarav-1',
  email: 'aarav@gmail.com',
  full_name: 'Aarav Sathe',
  created_at: new Date().toISOString(),
};

appStore.setCurrentUser(defaultUser);

// Create a collaborative Family group with folders and recurring tasks
const familyGroup = appStore.createGroup('Family & Home', 'Shared household chores and errands');
appStore.setActiveGroup(familyGroup.id);

const choresFolder = appStore.createFolder('Chores', '#6366F1');
const groceryFolder = appStore.createFolder('Groceries', '#10B981');

// Monday Dishwasher recurring task
const mondayDate = new Date();
mondayDate.setDate(mondayDate.getDate() + ((1 + 7 - mondayDate.getDay()) % 7 || 7));
mondayDate.setHours(8, 0, 0, 0);

appStore.createTask({
  title: 'Empty Dishwasher',
  folder_id: choresFolder.id,
  priority: 'high',
  due_date: mondayDate.toISOString(),
  assigned_to: ['John', 'Sarah'],
  recurrence: {
    frequency: 'weekly',
    interval: 1,
    days_of_week: ['mon'],
    time_of_day: '08:00',
  },
});

appStore.createTask({
  title: 'Organic almond milk & oats',
  folder_id: groceryFolder.id,
  priority: 'medium',
  assigned_to: ['Aarav'],
});

export default function App() {
  const [, setTick] = useState(0);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority>('medium');

  // Re-render when store updates
  useEffect(() => {
    return appStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const state = appStore.getState();
  const activeGroup = state.groups.find((g) => g.id === state.activeGroupId);
  const folders = appStore.getActiveGroupFolders();
  const tasks = appStore.getActiveGroupTasks(selectedFolderId);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    appStore.createTask({
      title: newTaskTitle.trim(),
      folder_id: selectedFolderId,
      priority: selectedPriority,
    });
    setNewTaskTitle('');
  };

  const handleToggleTask = (taskId: string) => {
    appStore.toggleTaskCompletion(taskId);
  };

  const priorityColors: Record<TaskPriority, string> = {
    urgent: '#EF4444',
    high: '#F97316',
    medium: '#6366F1',
    low: '#6B7280',
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Header with Group Selector */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>TaskPlane</Text>
            <Text style={styles.groupSubtitle}>
              Group: <Text style={styles.groupHighlight}>{activeGroup?.name || 'Personal'}</Text>
            </Text>
          </View>
          <View style={styles.userBadge}>
            <Text style={styles.userBadgeText}>AS</Text>
          </View>
        </View>

        {/* Group Switcher Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupScroll}>
          {state.groups.map((group) => {
            const isActive = group.id === state.activeGroupId;
            return (
              <TouchableOpacity
                key={group.id}
                testID={`group-${group.id}`}
                style={[styles.groupPill, isActive && styles.groupPillActive]}
                onPress={() => {
                  appStore.setActiveGroup(group.id);
                  setSelectedFolderId(null);
                }}
              >
                <Text style={[styles.groupPillText, isActive && styles.groupPillTextActive]}>
                  {group.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Folders Bar */}
        <View style={styles.foldersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              testID="folder-all"
              style={[styles.folderChip, selectedFolderId === null && styles.folderChipActive]}
              onPress={() => setSelectedFolderId(null)}
            >
              <Text style={[styles.folderChipText, selectedFolderId === null && styles.folderChipTextActive]}>
                All Tasks ({state.tasks.filter((t) => t.group_id === state.activeGroupId).length})
              </Text>
            </TouchableOpacity>

            {folders.map((folder) => {
              const isActive = folder.id === selectedFolderId;
              const count = state.tasks.filter(
                (t) => t.group_id === state.activeGroupId && t.folder_id === folder.id
              ).length;
              return (
                <TouchableOpacity
                  key={folder.id}
                  testID={`folder-${folder.id}`}
                  style={[styles.folderChip, isActive && styles.folderChipActive]}
                  onPress={() => setSelectedFolderId(folder.id)}
                >
                  <View style={[styles.folderColorDot, { backgroundColor: folder.color || '#6366F1' }]} />
                  <Text style={[styles.folderChipText, isActive && styles.folderChipTextActive]}>
                    {folder.name} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Quick Add Bar */}
        <View style={styles.quickAddBar}>
          <TextInput
            testID="quick-add-input"
            style={styles.quickAddInput}
            placeholder="Add a new task..."
            placeholderTextColor="#6B7280"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            onSubmitEditing={handleAddTask}
          />
          <TouchableOpacity testID="quick-add-button" style={styles.quickAddButton} onPress={handleAddTask}>
            <Text style={styles.quickAddButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Priority Selector for New Tasks */}
        <View style={styles.priorityBar}>
          {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => {
            const isSelected = selectedPriority === p;
            return (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityChip,
                  isSelected && { backgroundColor: priorityColors[p] },
                ]}
                onPress={() => setSelectedPriority(p)}
              >
                <Text style={[styles.priorityChipText, isSelected && styles.priorityChipTextActive]}>
                  {p.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Task List */}
        <ScrollView style={styles.taskList} contentContainerStyle={styles.taskListContent}>
          {tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No tasks in this folder yet.</Text>
              <Text style={styles.emptyStateSubtext}>Add one above or check your smartwatch!</Text>
            </View>
          ) : (
            tasks.map((task: Task) => (
              <TouchableOpacity
                key={task.id}
                testID={`task-${task.id}`}
                style={[styles.taskCard, task.is_completed && styles.taskCardCompleted]}
                onPress={() => handleToggleTask(task.id)}
              >
                <View
                  style={[
                    styles.checkbox,
                    task.is_completed && styles.checkboxCompleted,
                    { borderColor: priorityColors[task.priority] },
                  ]}
                >
                  {task.is_completed && <Text style={styles.checkmark}>✓</Text>}
                </View>

                <View style={styles.taskInfo}>
                  <Text
                    style={[
                      styles.taskTitle,
                      task.is_completed && styles.taskTitleCompleted,
                    ]}
                  >
                    {task.title}
                  </Text>

                  <View style={styles.taskMetaRow}>
                    {task.recurrence && (
                      <View style={styles.metaBadgeRecurrence}>
                        <Text style={styles.metaBadgeRecurrenceText}>🔄 Every {task.recurrence.days_of_week?.[0]?.toUpperCase() || 'Week'}</Text>
                      </View>
                    )}

                    {task.assigned_to && task.assigned_to.length > 0 && (
                      <View style={styles.metaBadgeAssignee}>
                        <Text style={styles.metaBadgeAssigneeText}>
                          👤 {task.assigned_to.join(', ')}
                        </Text>
                      </View>
                    )}

                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: priorityColors[task.priority] },
                      ]}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900
    paddingTop: Platform.OS === 'android' ? 35 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  groupSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  groupHighlight: {
    color: '#818CF8',
    fontWeight: '700',
  },
  userBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  groupScroll: {
    maxHeight: 40,
    marginVertical: 6,
  },
  groupPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    marginRight: 8,
  },
  groupPillActive: {
    backgroundColor: '#6366F1',
  },
  groupPillText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  groupPillTextActive: {
    color: '#FFFFFF',
  },
  foldersSection: {
    marginVertical: 8,
  },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  folderChipActive: {
    borderColor: '#818CF8',
    backgroundColor: '#312E81',
  },
  folderColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  folderChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  folderChipTextActive: {
    color: '#E0E7FF',
  },
  quickAddBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickAddInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 15,
    paddingVertical: 8,
  },
  quickAddButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  quickAddButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  priorityBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  priorityChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    marginHorizontal: 3,
  },
  priorityChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  priorityChipTextActive: {
    color: '#FFFFFF',
  },
  taskList: {
    flex: 1,
    marginTop: 8,
  },
  taskListContent: {
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 4,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  taskCardCompleted: {
    opacity: 0.5,
    backgroundColor: '#0F172A',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  metaBadgeRecurrence: {
    backgroundColor: '#3730A3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  metaBadgeRecurrenceText: {
    color: '#C7D2FE',
    fontSize: 11,
    fontWeight: '600',
  },
  metaBadgeAssignee: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  metaBadgeAssigneeText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '500',
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 'auto',
  },
});
