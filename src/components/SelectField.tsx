import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
};

const SelectField = ({ label, value, onChange, options, error }: SelectFieldProps): React.JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  const selected = options.find((option) => option.value === value);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={[styles.select, !!error && styles.selectError]} onPress={() => setIsOpen(true)}>
        <Text style={styles.value}>{selected?.label ?? 'Select priority'}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal transparent visible={isOpen} animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <View style={styles.sheet}>
            {options.map((option) => (
              <Pressable
                key={option.value}
                style={styles.option}
                onPress={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <Text style={[styles.optionText, option.value === value && styles.selectedOption]}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  label: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  select: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#111827',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  selectError: {
    borderColor: '#F87171',
  },
  value: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '500',
  },
  error: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#374151',
    overflow: 'hidden',
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  optionText: {
    color: '#E5E7EB',
    fontSize: 15,
  },
  selectedOption: {
    color: '#60A5FA',
    fontWeight: '700',
  },
});

export default SelectField;
