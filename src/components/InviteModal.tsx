import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { GroupPermissions } from '../types';

interface InviteModalProps {
  visible: boolean;
  groupName: string;
  onClose: () => void;
  onInvite: (email: string, permissions: GroupPermissions) => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  visible,
  groupName,
  onClose,
  onInvite,
}) => {
  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState<GroupPermissions>({
    can_create_tasks: true,
    can_edit_tasks: true,
    can_manage_folders: false,
    can_participate: true,
  });

  const handleSend = () => {
    if (!email.trim() || !email.includes('@')) return;
    onInvite(email.trim(), permissions);
    setEmail('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Invite to {groupName}</Text>
          <Text style={styles.subtitle}>
            Enter their Google email. When they sign in with Google, they will automatically join.
          </Text>

          <TextInput
            testID="invite-email-input"
            style={styles.input}
            placeholder="colleague@gmail.com"
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.sectionHeader}>Member Permissions</Text>

          <View style={styles.permissionRow}>
            <Text style={styles.permissionLabel}>Can create tasks</Text>
            <Switch
              value={permissions.can_create_tasks}
              onValueChange={(val) => setPermissions((p) => ({ ...p, can_create_tasks: val }))}
              trackColor={{ false: '#334155', true: '#6366F1' }}
            />
          </View>

          <View style={styles.permissionRow}>
            <Text style={styles.permissionLabel}>Can edit tasks</Text>
            <Switch
              value={permissions.can_edit_tasks}
              onValueChange={(val) => setPermissions((p) => ({ ...p, can_edit_tasks: val }))}
              trackColor={{ false: '#334155', true: '#6366F1' }}
            />
          </View>

          <View style={styles.permissionRow}>
            <Text style={styles.permissionLabel}>Can manage folders</Text>
            <Switch
              value={permissions.can_manage_folders}
              onValueChange={(val) => setPermissions((p) => ({ ...p, can_manage_folders: val }))}
              trackColor={{ false: '#334155', true: '#6366F1' }}
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="send-invite-button"
              style={[styles.inviteBtn, !email.includes('@') && styles.inviteBtnDisabled]}
              onPress={handleSend}
              disabled={!email.includes('@')}
            >
              <Text style={styles.inviteBtnText}>Send Invite</Text>
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
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 16,
    lineHeight: 18,
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
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  permissionLabel: {
    color: '#E2E8F0',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 10,
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
  inviteBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  inviteBtnDisabled: {
    opacity: 0.4,
  },
  inviteBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
