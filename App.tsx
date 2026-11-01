import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TaskStore } from './src/store';
import { Task, TaskPriority, RecurrenceRule } from './src/types';
import { InviteModal } from './src/components/InviteModal';
import { FolderModal } from './src/components/FolderModal';
import { TaskModal } from './src/components/TaskModal';

export const appStore = new TaskStore();

// Bootstrap seed data
const defaultUser = {
  id: 'user-aarav-1',
  email: 'aarav@gmail.com',
  full_name: 'Aarav Sathe',
  created_at: new Date().toISOString(),
};
appStore.setCurrentUser(defaultUser);

// Family & Home workspace
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
  notes: 'Check top rack glasses and sanitize filter',
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
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [, setTick] = useState(0);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority>('medium');

  // Modals
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useEffect(() => {
    return appStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const state = appStore.getState();
  const activeGroup = state.groups.find((g) => g.id === state.activeGroupId);
  const folders = appStore.getActiveGroupFolders();
  const tasks = appStore.getActiveGroupTasks(selectedFolderId);
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0] || null;

  const handleQuickAdd = () => {
    if (!newTaskTitle.trim()) return;
    appStore.createTask({
      title: newTaskTitle.trim(),
      folder_id: selectedFolderId,
      priority: selectedPriority,
    });
    setNewTaskTitle('');
  };

  const handleDetailedTaskCreate = (params: {
    title: string;
    notes?: string;
    folder_id?: string | null;
    priority: TaskPriority;
    assigned_to: string[];
    recurrence?: RecurrenceRule | null;
  }) => {
    appStore.createTask(params);
  };

  const handleToggleTask = (taskId: string) => {
    appStore.toggleTaskCompletion(taskId);
  };

  const handleInvite = (email: string, permissions: any) => {
    if (!state.activeGroupId) return;
    appStore.inviteMemberByEmail(state.activeGroupId, email, permissions);
  };

  const handleCreateFolder = (name: string, color: string) => {
    appStore.createFolder(name, color);
  };

  const priorityColors: Record<TaskPriority, string> = {
    urgent: '#EF4444',
    high: '#F97316',
    medium: '#6366F1',
    low: '#6B7280',
  };

  const availableMembers = [
    { id: '1', name: 'Aarav' },
    { id: '2', name: 'John' },
    { id: '3', name: 'Sarah' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <View style={[styles.mainLayout, isTablet && styles.tabletRow]}>
        {/* ========================================================= */}
        {/* COLUMN 1: SIDEBAR (Groups, Folders, Admin Invite)         */}
        {/* ========================================================= */}
        <View style={[styles.sidebar, isTablet ? styles.sidebarTablet : styles.sidebarMobile]}>
          {/* Brand Header */}
          <View style={styles.brandRow}>
            <View>
              <Text style={styles.brandTitle}>TaskPlane</Text>
              <Text style={styles.platformSubtext}>Cloud & Wrist Sync</Text>
            </View>
            <View style={styles.userBadge}>
              <Text style={styles.userBadgeText}>AS</Text>
            </View>
          </View>

          {/* Groups Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Groups / Teams</Text>
              <TouchableOpacity
                testID="new-group-btn"
                onPress={() => {
                  const g = appStore.createGroup(`Workspace ${state.groups.length + 1}`);
                  appStore.setActiveGroup(g.id);
                }}
              >
                <Text style={styles.addSectionBtn}>+ New</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal={!isTablet} showsHorizontalScrollIndicator={false} style={styles.groupScroll}>
              {state.groups.map((group) => {
                const isActive = group.id === state.activeGroupId;
                return (
                  <TouchableOpacity
                    key={group.id}
                    testID={`group-${group.id}`}
                    style={[styles.groupItem, isActive && styles.groupItemActive]}
                    onPress={() => {
                      appStore.setActiveGroup(group.id);
                      setSelectedFolderId(null);
                    }}
                  >
                    <Text style={[styles.groupItemText, isActive && styles.groupItemTextActive]}>
                      🏢 {group.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Folders Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Folders</Text>
              <TouchableOpacity testID="new-folder-modal-btn" onPress={() => setIsFolderOpen(true)}>
                <Text style={styles.addSectionBtn}>+ Folder</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal={!isTablet} showsHorizontalScrollIndicator={false} style={styles.folderScroll}>
              <TouchableOpacity
                testID="folder-all"
                style={[styles.folderItem, selectedFolderId === null && styles.folderItemActive]}
                onPress={() => setSelectedFolderId(null)}
              >
                <Text style={[styles.folderItemText, selectedFolderId === null && styles.folderItemTextActive]}>
                  📁 All Tasks ({state.tasks.filter((t) => t.group_id === state.activeGroupId).length})
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
                    style={[styles.folderItem, isActive && styles.folderItemActive]}
                    onPress={() => setSelectedFolderId(folder.id)}
                  >
                    <View style={[styles.folderColorDot, { backgroundColor: folder.color || '#6366F1' }]} />
                    <Text style={[styles.folderItemText, isActive && styles.folderItemTextActive]}>
                      {folder.name} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Google OAuth Member Invite Bar */}
          <TouchableOpacity
            testID="invite-collaborator-btn"
            style={styles.inviteButton}
            onPress={() => setIsInviteOpen(true)}
          >
            <Text style={styles.inviteButtonText}>✉️ Invite Collaborator</Text>
            <Text style={styles.inviteButtonSubtext}>Google OAuth Link</Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================= */}
        {/* COLUMN 2: MAIN TASK LIST & QUICK ADD                      */}
        {/* ========================================================= */}
        <View style={styles.centerPanel}>
          {/* Subheader with Active Group & Folder */}
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.activeGroupTitle}>{activeGroup?.name || 'Workspace'}</Text>
              <Text style={styles.activeFolderSubtitle}>
                {selectedFolderId
                  ? folders.find((f) => f.id === selectedFolderId)?.name || 'Folder'
                  : 'All Tasks'}
              </Text>
            </View>

            <TouchableOpacity
              testID="open-task-modal-btn"
              style={styles.detailedAddBtn}
              onPress={() => setIsTaskModalOpen(true)}
            >
              <Text style={styles.detailedAddBtnText}>+ Custom Task</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Add Bar */}
          <View style={styles.quickAddBar}>
            <TextInput
              testID="quick-add-input"
              style={styles.quickAddInput}
              placeholder="Quick-add task title..."
              placeholderTextColor="#64748B"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              onSubmitEditing={handleQuickAdd}
            />
            <TouchableOpacity testID="quick-add-button" style={styles.quickAddBtn} onPress={handleQuickAdd}>
              <Text style={styles.quickAddBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {/* Priority Chips */}
          <View style={styles.prioritySelectorBar}>
            {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => {
              const isSelected = selectedPriority === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityPill,
                    isSelected && { backgroundColor: priorityColors[p], borderColor: priorityColors[p] },
                  ]}
                  onPress={() => setSelectedPriority(p)}
                >
                  <Text style={[styles.priorityPillText, isSelected && styles.priorityPillTextActive]}>
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
                <Text style={styles.emptyStateText}>No tasks found in this view.</Text>
                <Text style={styles.emptyStateSubtext}>Add a task above or create one from your watch!</Text>
              </View>
            ) : (
              tasks.map((task) => {
                const isSelected = task.id === selectedTask?.id;
                return (
                  <TouchableOpacity
                    key={task.id}
                    testID={`task-${task.id}`}
                    style={[
                      styles.taskCard,
                      task.is_completed && styles.taskCardCompleted,
                      isSelected && isTablet && styles.taskCardSelected,
                    ]}
                    onPress={() => {
                      setSelectedTaskId(task.id);
                      if (!isTablet) {
                        handleToggleTask(task.id);
                      }
                    }}
                  >
                    <TouchableOpacity
                      testID={`checkbox-${task.id}`}
                      style={[
                        styles.checkbox,
                        task.is_completed && styles.checkboxCompleted,
                        { borderColor: priorityColors[task.priority] },
                      ]}
                      onPress={() => handleToggleTask(task.id)}
                    >
                      {task.is_completed && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>

                    <View style={styles.taskCardBody}>
                      <Text
                        style={[styles.taskTitleText, task.is_completed && styles.taskTitleCompleted]}
                      >
                        {task.title}
                      </Text>

                      <View style={styles.badgeRow}>
                        {task.recurrence && (
                          <View style={styles.recurrenceBadge}>
                            <Text style={styles.recurrenceBadgeText}>
                              🔄 Every {task.recurrence.days_of_week?.[0]?.toUpperCase() || 'Week'}
                            </Text>
                          </View>
                        )}

                        {task.assigned_to && task.assigned_to.length > 0 && (
                          <View style={styles.assigneeBadge}>
                            <Text style={styles.assigneeBadgeText}>
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
                );
              })
            )}
          </ScrollView>
        </View>

        {/* ========================================================= */}
        {/* COLUMN 3: DETAIL INSPECTOR PANEL (Tablet / Desktop)       */}
        {/* ========================================================= */}
        {isTablet && (
          <View style={styles.inspectorPanel}>
            <Text style={styles.inspectorHeader}>Task Details</Text>
            {selectedTask ? (
              <View style={styles.inspectorCard}>
                <Text style={styles.inspectorTaskTitle}>{selectedTask.title}</Text>

                <View style={styles.inspectorRow}>
                  <Text style={styles.inspectorLabel}>Status:</Text>
                  <Text
                    style={[
                      styles.inspectorValue,
                      { color: selectedTask.is_completed ? '#10B981' : '#F59E0B' },
                    ]}
                  >
                    {selectedTask.is_completed ? 'Completed' : 'Pending'}
                  </Text>
                </View>

                <View style={styles.inspectorRow}>
                  <Text style={styles.inspectorLabel}>Priority:</Text>
                  <Text style={[styles.inspectorValue, { color: priorityColors[selectedTask.priority] }]}>
                    {selectedTask.priority.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.inspectorRow}>
                  <Text style={styles.inspectorLabel}>Assignees:</Text>
                  <Text style={styles.inspectorValue}>
                    {selectedTask.assigned_to.join(', ') || 'Unassigned'}
                  </Text>
                </View>

                {selectedTask.recurrence && (
                  <View style={styles.inspectorRow}>
                    <Text style={styles.inspectorLabel}>Recurrence:</Text>
                    <Text style={styles.inspectorValue}>
                      {selectedTask.recurrence.frequency} (Every {selectedTask.recurrence.days_of_week?.[0] || 'cycle'})
                    </Text>
                  </View>
                )}

                {selectedTask.notes && (
                  <View style={styles.inspectorNotesSection}>
                    <Text style={styles.inspectorLabel}>Notes:</Text>
                    <Text style={styles.inspectorNotesText}>{selectedTask.notes}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.toggleCompletionBtn,
                    selectedTask.is_completed && styles.toggleCompletionBtnActive,
                  ]}
                  onPress={() => handleToggleTask(selectedTask.id)}
                >
                  <Text style={styles.toggleCompletionBtnText}>
                    {selectedTask.is_completed ? 'Mark as Incomplete' : 'Mark as Completed'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.inspectorEmpty}>
                <Text style={styles.inspectorEmptyText}>Select a task to inspect</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Modals */}
      <InviteModal
        visible={isInviteOpen}
        groupName={activeGroup?.name || 'Workspace'}
        onClose={() => setIsInviteOpen(false)}
        onInvite={handleInvite}
      />

      <FolderModal
        visible={isFolderOpen}
        onClose={() => setIsFolderOpen(false)}
        onCreateFolder={handleCreateFolder}
      />

      <TaskModal
        visible={isTaskModalOpen}
        folders={folders}
        currentFolderId={selectedFolderId}
        members={availableMembers}
        onClose={() => setIsTaskModalOpen(false)}
        onCreateTask={handleDetailedTaskCreate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: Platform.OS === 'android' ? 35 : 0,
  },
  mainLayout: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  tabletRow: {
    flexDirection: 'row',
  },
  // Column 1: Sidebar
  sidebar: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: '#334155',
  },
  sidebarTablet: {
    width: 260,
  },
  sidebarMobile: {
    paddingBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  platformSubtext: {
    fontSize: 11,
    color: '#818CF8',
    fontWeight: '600',
    marginTop: 2,
  },
  userBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addSectionBtn: {
    fontSize: 12,
    fontWeight: '700',
    color: '#818CF8',
  },
  groupScroll: {
    maxHeight: 120,
  },
  groupItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  groupItemActive: {
    backgroundColor: '#3730A3',
    borderColor: '#818CF8',
  },
  groupItemText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  groupItemTextActive: {
    color: '#FFFFFF',
  },
  folderScroll: {
    maxHeight: 140,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  folderItemActive: {
    backgroundColor: '#312E81',
    borderColor: '#818CF8',
  },
  folderColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  folderItemText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  folderItemTextActive: {
    color: '#E0E7FF',
  },
  inviteButton: {
    backgroundColor: '#312E81',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6366F1',
    marginTop: 'auto',
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  inviteButtonSubtext: {
    color: '#A5B4FC',
    fontSize: 10,
    marginTop: 2,
  },
  // Column 2: Center Panel
  centerPanel: {
    flex: 1,
    padding: 16,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeGroupTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  activeFolderSubtitle: {
    fontSize: 13,
    color: '#818CF8',
    fontWeight: '600',
    marginTop: 2,
  },
  detailedAddBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#475569',
  },
  detailedAddBtnText: {
    color: '#E2E8F0',
    fontWeight: '700',
    fontSize: 12,
  },
  quickAddBar: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
  },
  quickAddInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 15,
    paddingVertical: 8,
  },
  quickAddBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'center',
  },
  quickAddBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  prioritySelectorBar: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  priorityPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  priorityPillText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
  },
  priorityPillTextActive: {
    color: '#FFFFFF',
  },
  taskList: {
    flex: 1,
  },
  taskListContent: {
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
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
  taskCardSelected: {
    borderColor: '#818CF8',
    backgroundColor: '#1E294B',
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
  taskCardBody: {
    flex: 1,
  },
  taskTitleText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  recurrenceBadge: {
    backgroundColor: '#3730A3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  recurrenceBadgeText: {
    color: '#C7D2FE',
    fontSize: 11,
    fontWeight: '600',
  },
  assigneeBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  assigneeBadgeText: {
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
  // Column 3: Inspector Panel
  inspectorPanel: {
    width: 300,
    backgroundColor: '#1E293B',
    padding: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#334155',
  },
  inspectorHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  inspectorCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inspectorTaskTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  inspectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inspectorLabel: {
    color: '#94A3B8',
    fontSize: 13,
  },
  inspectorValue: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  inspectorNotesSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  inspectorNotesText: {
    color: '#CBD5E1',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  toggleCompletionBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  toggleCompletionBtnActive: {
    backgroundColor: '#EF4444',
  },
  toggleCompletionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  inspectorEmpty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  inspectorEmptyText: {
    color: '#64748B',
    fontSize: 14,
  },
});
