import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Folder, TaskPriority, RecurrenceRule, DayOfWeek } from '../types';

interface TaskModalProps {
  visible: boolean;
  folders: Folder[];
  currentFolderId: string | null;
  members: Array<{ id: string; name: string }>;
  onClose: () => void;
  onCreateTask: (params: {
    title: string;
    notes?: string;
    folder_id?: string | null;
    priority: TaskPriority;
    assigned_to: string[];
    recurrence?: RecurrenceRule | null;
  }) => void;
}

const DAYS: Array<{ key: DayOfWeek; label: string }> = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  visible,
  folders,
  currentFolderId,
  members,
  onClose,
  onCreateTask,
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [folderId, setFolderId] = useState<string | null>(currentFolderId);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly'>('weekly');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(['mon']);

  const toggleAssignee = (id: string) => {
    setAssignedTo((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleCreate = () => {
    if (!title.trim()) return;

    let recurrence: RecurrenceRule | null = null;
    if (isRecurring) {
      recurrence = {
        frequency: recurringFrequency,
        interval: 1,
        days_of_week: recurringFrequency === 'weekly' ? selectedDays : undefined,
        time_of_day: '08:00',
      };
    }

    onCreateTask({
      title: title.trim(),
      notes: notes.trim() || undefined,
      folder_id: folderId,
      priority,
      assigned_to: assignedTo.length > 0 ? assignedTo : members.slice(0, 1).map((m) => m.name),
      recurrence,
    });

    setTitle('');
    setNotes('');
    setIsRecurring(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>New Task</Text>

          <ScrollView style={styles.scrollArea}>
            <Text style={styles.fieldLabel}>Task Title</Text>
            <TextInput
              testID="task-modal-title-input"
              style={styles.input}
              placeholder="e.g. Empty dishwasher, Review pull request"
              placeholderTextColor="#64748B"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.fieldLabel}>Notes / Checklist (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add details, links, or instructions..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />

            {/* Folder Allocation */}
            <Text style={styles.fieldLabel}>Allocate into Folder</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
              <TouchableOpacity
                style={[styles.chip, folderId === null && styles.chipActive]}
                onPress={() => setFolderId(null)}
              >
                <Text style={[styles.chipText, folderId === null && styles.chipTextActive]}>
                  No Folder
                </Text>
              </TouchableOpacity>
              {folders.map((f) => {
                const isSelected = folderId === f.id;
                return (
                  <TouchableOpacity
                    key={f.id}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setFolderId(f.id)}
                  >
                    <View style={[styles.colorDot, { backgroundColor: f.color || '#6366F1' }]} />
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {f.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Priority Picker */}
            <Text style={styles.fieldLabel}>Priority</Text>
            <View style={styles.priorityRow}>
              {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => {
                const isSelected = priority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[styles.priorityChip, isSelected && styles.priorityChipActive]}
                    onPress={() => setPriority(p)}
                  >
                    <Text style={[styles.priorityText, isSelected && styles.priorityTextActive]}>
                      {p.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Assignees (Multi-Participant) */}
            <Text style={styles.fieldLabel}>Assign Participants (Wrist Notifications)</Text>
            <View style={styles.membersRow}>
              {members.map((m) => {
                const isSelected = assignedTo.includes(m.name);
                return (
                  <TouchableOpacity
                    key={m.id}
                    testID={`assignee-${m.name}`}
                    style={[styles.memberPill, isSelected && styles.memberPillActive]}
                    onPress={() => toggleAssignee(m.name)}
                  >
                    <Text style={[styles.memberPillText, isSelected && styles.memberPillTextActive]}>
                      👤 {m.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Recurrence Builder */}
            <Text style={styles.fieldLabel}>Recurrence</Text>
            <View style={styles.recurrenceToggleRow}>
              <TouchableOpacity
                style={[styles.recurrenceChip, !isRecurring && styles.recurrenceChipActive]}
                onPress={() => setIsRecurring(false)}
              >
                <Text style={[styles.chipText, !isRecurring && styles.chipTextActive]}>One-time</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="recurrence-toggle-btn"
                style={[styles.recurrenceChip, isRecurring && styles.recurrenceChipActive]}
                onPress={() => setIsRecurring(true)}
              >
                <Text style={[styles.chipText, isRecurring && styles.chipTextActive]}>🔄 Recurring</Text>
              </TouchableOpacity>
            </View>

            {isRecurring && (
              <View style={styles.recurrenceOptions}>
                <View style={styles.pillRow}>
                  <TouchableOpacity
                    style={[styles.chip, recurringFrequency === 'weekly' && styles.chipActive]}
                    onPress={() => setRecurringFrequency('weekly')}
                  >
                    <Text style={[styles.chipText, recurringFrequency === 'weekly' && styles.chipTextActive]}>
                      Weekly
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chip, recurringFrequency === 'daily' && styles.chipActive]}
                    onPress={() => setRecurringFrequency('daily')}
                  >
                    <Text style={[styles.chipText, recurringFrequency === 'daily' && styles.chipTextActive]}>
                      Daily
                    </Text>
                  </TouchableOpacity>
                </View>

                {recurringFrequency === 'weekly' && (
                  <View style={styles.daysRow}>
                    {DAYS.map((d) => {
                      const isSelected = selectedDays.includes(d.key);
                      return (
                        <TouchableOpacity
                          key={d.key}
                          testID={`day-${d.key}`}
                          style={[styles.dayCircle, isSelected && styles.dayCircleActive]}
                          onPress={() => toggleDay(d.key)}
                        >
                          <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>
                            {d.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="create-task-confirm-btn"
              style={[styles.createBtn, !title.trim() && styles.createBtnDisabled]}
              onPress={handleCreate}
              disabled={!title.trim()}
            >
              <Text style={styles.createBtnText}>Create Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  scrollArea: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: {
    minHeight: 65,
    textAlignVertical: 'top',
  },
  pillRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: {
    backgroundColor: '#312E81',
    borderColor: '#818CF8',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#E0E7FF',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 4,
  },
  priorityChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  priorityChipActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  priorityText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  priorityTextActive: {
    color: '#FFFFFF',
  },
  membersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  memberPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  memberPillActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#3B82F6',
  },
  memberPillText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  memberPillTextActive: {
    color: '#93C5FD',
    fontWeight: '700',
  },
  recurrenceToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  recurrenceChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  recurrenceChipActive: {
    backgroundColor: '#3730A3',
    borderColor: '#818CF8',
  },
  recurrenceOptions: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dayCircleActive: {
    backgroundColor: '#6366F1',
    borderColor: '#818CF8',
  },
  dayText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 8,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  createBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  createBtnDisabled: {
    opacity: 0.4,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
