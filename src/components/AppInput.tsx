import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

const AppInput = (props: TextInputProps): React.JSX.Element => {
  return (
    <View style={styles.container}>
      <TextInput
        {...props}
        placeholderTextColor="#9CA3AF"
        style={[styles.input, props.style]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F9FAFB',
    fontSize: 16,
  },
});

export default AppInput;
