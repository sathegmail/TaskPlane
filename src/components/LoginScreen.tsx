import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { UserProfile } from '../types';

interface LoginScreenProps {
  onSignIn: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSignIn }) => {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const handleGoogleSignIn = (name: string, email: string) => {
    onSignIn({
      id: `user-${email.split('@')[0]}`,
      email,
      full_name: name,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
      created_at: new Date().toISOString(),
    });
  };

  const handleCustomSubmit = () => {
    if (!customEmail.includes('@') || !customName.trim()) return;
    handleGoogleSignIn(customName.trim(), customEmail.trim());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        {/* Brand Header */}
        <View style={styles.logoBadge}>
          <Text style={styles.logoBadgeText}>TP</Text>
        </View>
        <Text style={styles.brandTitle}>TaskPlane</Text>
        <Text style={styles.brandSubtitle}>
          Collaborative Workspaces & Smartwatch Task Management
        </Text>

        {/* Feature Highlights */}
        <View style={styles.featureBox}>
          <Text style={styles.featureItem}>✨ Multi-tenant Groups & Folder Allocation</Text>
          <Text style={styles.featureItem}>🔄 Recurring Schedules (e.g. Every Monday)</Text>
          <Text style={styles.featureItem}>⌚ Universal Smartwatch Wrist Triage</Text>
        </View>

        {!isCustomMode ? (
          <View style={styles.authActionArea}>
            {/* Primary Google OAuth Button */}
            <TouchableOpacity
              testID="google-signin-primary"
              style={styles.googleButton}
              onPress={() => handleGoogleSignIn('Aarav Sathe', 'aarav@gmail.com')}
            >
              <View style={styles.googleIconContainer}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <Text style={styles.switchAccountPrompt}>— Or test as a team collaborator —</Text>

            <View style={styles.collaboratorRow}>
              <TouchableOpacity
                testID="signin-john"
                style={styles.collaboratorChip}
                onPress={() => handleGoogleSignIn('John Doe', 'john@gmail.com')}
              >
                <Text style={styles.collaboratorChipText}>👤 John (Member)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="signin-sarah"
                style={styles.collaboratorChip}
                onPress={() => handleGoogleSignIn('Sarah Smith', 'sarah@gmail.com')}
              >
                <Text style={styles.collaboratorChipText}>👤 Sarah (Member)</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.customEmailLink}
              onPress={() => setIsCustomMode(true)}
            >
              <Text style={styles.customEmailLinkText}>Sign in with another Google email</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.customAuthArea}>
            <Text style={styles.customHeader}>Enter your Google Account</Text>
            <TextInput
              testID="custom-name-input"
              style={styles.input}
              placeholder="Your full name"
              placeholderTextColor="#64748B"
              value={customName}
              onChangeText={setCustomName}
            />
            <TextInput
              testID="custom-email-input"
              style={styles.input}
              placeholder="yourname@gmail.com"
              placeholderTextColor="#64748B"
              autoCapitalize="none"
              keyboardType="email-address"
              value={customEmail}
              onChangeText={setCustomEmail}
            />

            <TouchableOpacity
              testID="custom-signin-btn"
              style={[
                styles.googleButton,
                (!customEmail.includes('@') || !customName.trim()) && styles.buttonDisabled,
              ]}
              onPress={handleCustomSubmit}
              disabled={!customEmail.includes('@') || !customName.trim()}
            >
              <Text style={styles.googleButtonText}>Sign In with Google Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backLink}
              onPress={() => setIsCustomMode(false)}
            >
              <Text style={styles.backLinkText}>← Back to quick sign in</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#818CF8',
  },
  logoBadgeText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  featureBox: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  featureItem: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  authActionArea: {
    width: '100%',
    alignItems: 'center',
  },
  googleButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EA4335',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleIconText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  googleButtonText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  switchAccountPrompt: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 12,
  },
  collaboratorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  collaboratorChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
  },
  collaboratorChipText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  customEmailLink: {
    marginTop: 6,
  },
  customEmailLinkText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '600',
  },
  customAuthArea: {
    width: '100%',
  },
  customHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 10,
  },
  backLink: {
    marginTop: 14,
    alignSelf: 'center',
  },
  backLinkText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
});
