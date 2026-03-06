import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

type InputFieldProps = TextInputProps & {
  label: string;
  error?: string;
  maxLength?: number;
  currentLength?: number;
};

const InputField = ({
  label,
  error,
  maxLength,
  currentLength,
  style,
  ...textInputProps
}: InputFieldProps): React.JSX.Element => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#6B7280"
        style={[styles.input, style, !!error && styles.inputError]}
        maxLength={maxLength}
        {...textInputProps}
      />
      <View style={styles.metaRow}>
        {error ? <Text style={styles.error}>{error}</Text> : <View />}
        {typeof currentLength === 'number' && typeof maxLength === 'number' ? (
          <Text style={styles.counter}>
            {currentLength} / {maxLength}
          </Text>
        ) : null}
      </View>
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
  input: {
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#111827',
    color: '#F9FAFB',
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#F87171',
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  error: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '500',
  },
  counter: {
    color: '#9CA3AF',
    fontSize: 12,
  },
});

export default InputField;
