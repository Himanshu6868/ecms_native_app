import React, { useMemo, useState } from 'react';
import { Alert, Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { firestore } from '../services/firebase/firebase';
import Button from '../components/Button';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';

const DESCRIPTION_MAX = 5000;
const DEFAULT_PRIORITY = 'MEDIUM' as const;
const DEFAULT_LOCATION = 'No location captured yet';
const DEFAULT_ATTACHMENT = 'No file chosen';
const TICKETS_COLLECTION = 'tickets';

type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

const priorityOptions = [
  { label: 'LOW', value: 'LOW' },
  { label: 'MEDIUM', value: 'MEDIUM' },
  { label: 'HIGH', value: 'HIGH' },
  { label: 'CRITICAL', value: 'CRITICAL' },
];

const TicketCreationScreen = (): React.JSX.Element => {
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>(DEFAULT_PRIORITY);
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [attachment, setAttachment] = useState(DEFAULT_ATTACHMENT);
  const [errors, setErrors] = useState<{ title?: string; description?: string; priority?: string; category?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const descriptionLength = description.length;

  const isDescriptionTooShort = useMemo(() => description.trim().length > 0 && description.trim().length < 20, [description]);

  const resetForm = (): void => {
    setTitle('');
    setDescription('');
    setPriority(DEFAULT_PRIORITY);
    setCategory('');
    setLocation(DEFAULT_LOCATION);
    setAttachment(DEFAULT_ATTACHMENT);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const nextErrors: { title?: string; description?: string; priority?: string; category?: string } = {};

    if (!title.trim()) {
      nextErrors.title = 'Title is required';
    }

    if (!description.trim()) {
      nextErrors.description = 'Issue description is required';
    }

    if (!priority) {
      nextErrors.priority = 'Priority is required';
    }

    if (!category.trim()) {
      nextErrors.category = 'Category is required';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    Keyboard.dismiss();

    if (isSubmitting) {
      return;
    }

    console.log('Submitting ticket...');
    console.log('Form values:', {
      title,
      description,
      priority,
      category,
    });

    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(firestore, TICKETS_COLLECTION), {
        title: title.trim(),
        description: description.trim(),
        priority,
        category: category.trim(),
        createdBy: 'dev-user',
        createdAt: serverTimestamp(),
        status: 'OPEN',
      });

      Alert.alert('Success', 'Ticket submitted successfully');
      resetForm();
    } catch (error) {
      console.error('Ticket Submit Error:', error);
      Alert.alert('Error', 'Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            label="Ticket Title (Required)"
            placeholder="Enter a short ticket title"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (errors.title) {
                setErrors((prev) => ({ ...prev, title: undefined }));
              }
            }}
            error={errors.title}
          />

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
              setPriority(selectedValue as TicketPriority);
              if (errors.priority) {
                setErrors((prev) => ({ ...prev, priority: undefined }));
              }
            }}
            options={priorityOptions}
            error={errors.priority}
          />

          <InputField
            label="Category (Required)"
            placeholder="e.g. Network, Hardware, Software"
            value={category}
            onChangeText={(text) => {
              setCategory(text);
              if (errors.category) {
                setErrors((prev) => ({ ...prev, category: undefined }));
              }
            }}
            error={errors.category}
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
            <Button
              title={isSubmitting ? 'Submitting...' : 'Submit Ticket'}
              onPress={() => {
                void handleSubmit();
              }}
              style={styles.footerButton}
              disabled={isSubmitting}
            />
          </View>
        </ScrollView>
      </View>
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
});

export default TicketCreationScreen;
