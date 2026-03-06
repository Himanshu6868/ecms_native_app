import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import Button from '../components/Button';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';

const DESCRIPTION_MAX = 5000;
const DEFAULT_PRIORITY = 'MEDIUM';
const DEFAULT_LOCATION = 'No location captured yet';
const DEFAULT_ATTACHMENT = 'No file chosen';

const priorityOptions = [
  { label: 'LOW', value: 'LOW' },
  { label: 'MEDIUM', value: 'MEDIUM' },
  { label: 'HIGH', value: 'HIGH' },
  { label: 'CRITICAL', value: 'CRITICAL' },
];

const TicketCreationScreen = (): React.JSX.Element => {
  const navigation = useNavigation();

  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(DEFAULT_PRIORITY);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [attachment, setAttachment] = useState(DEFAULT_ATTACHMENT);
  const [errors, setErrors] = useState<{ description?: string; priority?: string }>({});
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  const descriptionLength = description.length;

  const isDescriptionTooShort = useMemo(() => description.trim().length > 0 && description.trim().length < 20, [description]);

  const resetForm = (): void => {
    setDescription('');
    setPriority(DEFAULT_PRIORITY);
    setLocation(DEFAULT_LOCATION);
    setAttachment(DEFAULT_ATTACHMENT);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const nextErrors: { description?: string; priority?: string } = {};

    if (!description.trim()) {
      nextErrors.description = 'Issue description is required';
    } else if (description.trim().length < 20) {
      nextErrors.description = 'Description too short';
    }

    if (!priority) {
      nextErrors.priority = 'Priority is required';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (): void => {
    if (!validateForm()) {
      return;
    }

    setIsSuccessVisible(true);
  };

  const handleSuccessAcknowledge = (): void => {
    setIsSuccessVisible(false);
    resetForm();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              }
            }}
          >
            <Ionicons name="arrow-back" size={18} color="#E5E7EB" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>NEW TICKET</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Ticket Creation</Text>
          <Text style={styles.subtitle}>Capture issue details and submit for resolution.</Text>

          <InputField
            label="Issue Description (Required)"
            placeholder="Describe what happened, impact, and workaround attempted"
            multiline
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (errors.description) {
                setErrors((prev) => ({ ...prev, description: undefined }));
              }
            }}
            error={errors.description ?? (isDescriptionTooShort && !errors.description ? 'Description too short' : undefined)}
            currentLength={descriptionLength}
            maxLength={DESCRIPTION_MAX}
          />

          <SelectField
            label="Priority (Required)"
            value={priority}
            onChange={(selectedValue) => {
              setPriority(selectedValue);
              if (errors.priority) {
                setErrors((prev) => ({ ...prev, priority: undefined }));
              }
            }}
            options={priorityOptions}
            error={errors.priority}
          />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Location</Text>
            <Button title="Use Current Location" onPress={() => setLocation('Delhi, India')} variant="secondary" />
            <Text style={styles.sectionValue}>{location}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Attachments</Text>
            <Button title="Choose Files" onPress={() => setAttachment('incident-report.pdf')} variant="secondary" />
            <Text style={styles.sectionValue}>{attachment}</Text>
            <Text style={styles.helperText}>PNG, JPG, PDF, DOC up to 5MB</Text>
          </View>

          <View style={styles.footerActions}>
            <Button title="Clear Form" onPress={resetForm} variant="secondary" style={styles.footerButton} />
            <Button title="Submit Ticket" onPress={handleSubmit} style={styles.footerButton} />
          </View>
        </ScrollView>
      </View>

      <Modal transparent visible={isSuccessVisible} animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Ticket Submitted</Text>
            <Text style={styles.modalMessage}>Your ticket has been created successfully.</Text>
            <Button title="OK" onPress={handleSuccessAcknowledge} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#030712',
  },
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#DBEAFE',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 14,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionValue: {
    color: '#D1D5DB',
    marginTop: 10,
    fontSize: 13,
  },
  helperText: {
    color: '#6B7280',
    marginTop: 6,
    fontSize: 12,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  footerButton: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(3, 7, 18, 0.75)',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#374151',
    padding: 20,
    gap: 16,
  },
  modalTitle: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '700',
  },
  modalMessage: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default TicketCreationScreen;
