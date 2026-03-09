import React, { useMemo, useState } from 'react';
import { Alert, Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { addDoc, collection, GeoPoint, serverTimestamp } from 'firebase/firestore';

import { firestore } from '../services/firebase/firebase';
import Button from '../components/Button';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import { useAuthStore } from '../store/useAuthStore';

const DESCRIPTION_MAX = 5000;
const DEFAULT_PRIORITY = 'MEDIUM' as const;
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
  const { user, email } = useAuthStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>(DEFAULT_PRIORITY);
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState<string | null>(null);
  const [locationCoordinates, setLocationCoordinates] = useState<GeoPoint | null>(null);
  const [attachmentInput, setAttachmentInput] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ title?: string; description?: string; priority?: string; category?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);

  const descriptionLength = description.length;

  const isDescriptionTooShort = useMemo(() => description.trim().length > 0 && description.trim().length < 20, [description]);

  const resetForm = (): void => {
    setTitle('');
    setDescription('');
    setPriority(DEFAULT_PRIORITY);
    setCategory('');
    setLocation(null);
    setLocationCoordinates(null);
    setAttachmentInput('');
    setAttachments([]);
    setErrors({});
  };

  const getCurrentLocation = async (): Promise<void> => {
    if (isResolvingLocation) {
      return;
    }

    setIsResolvingLocation(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Location permission required', 'Please allow location access to capture your exact location.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      setLocationCoordinates(new GeoPoint(latitude, longitude));
      setLocation(`${latitude},${longitude}`);
    } catch (error: unknown) {
      console.error('Location fetch error:', error);
      Alert.alert('Location unavailable', 'Unable to capture your current location. Please try again.');
    } finally {
      setIsResolvingLocation(false);
    }
  };

  const handleAddAttachment = (): void => {
    const value = attachmentInput.trim();

    if (!value) {
      setAttachments(['https://example.com/test-file.pdf']);
      return;
    }

    setAttachments((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setAttachmentInput('');
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
      location,
      locationCoordinates,
      attachments,
    });

    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority,
        category: category.trim(),
        location: location ?? null,
        locationCoordinates: locationCoordinates ?? null,
        attachments: Array.isArray(attachments) ? attachments : [],
        createdBy: user ?? 'anonymous',
        createdByEmail: email ?? null,
        createdAt: serverTimestamp(),
        status: 'OPEN',
      };

      console.log('Final payload check:', payload);

      if (__DEV__) {
        await addDoc(collection(firestore, TICKETS_COLLECTION), {
          test: 'ok',
          createdAt: serverTimestamp(),
        });
      }

      await addDoc(collection(firestore, TICKETS_COLLECTION), payload);

      Alert.alert('Success', 'Ticket submitted successfully');
      resetForm();
    } catch (error: any) {
      console.error('Firestore error:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
      });

      const maybeFirebaseError = error as { code?: string; message?: string };
      const details = maybeFirebaseError?.code ? `\n(${maybeFirebaseError.code})` : '';

      Alert.alert('Error', `Failed to submit ticket. Please try again.${details}`);
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
            <Button
              title={isResolvingLocation ? 'Capturing Location...' : 'Use Current Location'}
              onPress={getCurrentLocation}
              variant="secondary"
              disabled={isResolvingLocation}
            />
            <Text style={styles.sectionValue}>{location ?? 'No location captured yet'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Attachments</Text>
            <InputField
              label="Attachment file name or URL"
              placeholder="e.g. incident-report.pdf or https://..."
              value={attachmentInput}
              onChangeText={setAttachmentInput}
            />
            <Button title="Add Attachment" onPress={handleAddAttachment} variant="secondary" />
            {attachments.length === 0 ? (
              <Text style={styles.sectionValue}>No files attached</Text>
            ) : (
              <View style={styles.attachmentList}>
                {attachments.map((item) => (
                  <View key={item} style={styles.attachmentRow}>
                    <Text style={styles.attachmentText}>{item}</Text>
                    <Pressable onPress={() => setAttachments((prev) => prev.filter((entry) => entry !== item))}>
                      <Text style={styles.removeAttachment}>Remove</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
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
  attachmentList: {
    marginTop: 10,
    gap: 8,
  },
  attachmentRow: {
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  attachmentText: {
    color: '#E5E7EB',
    flex: 1,
    marginRight: 12,
  },
  removeAttachment: {
    color: '#FCA5A5',
    fontWeight: '600',
  },
  footerButton: {
    flex: 1,
  },
});

export default TicketCreationScreen;
