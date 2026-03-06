import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

type ActionButtonVariant = 'primary' | 'secondary';

type ActionButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ActionButtonVariant;
  style?: ViewStyle;
};

const ActionButton = ({ title, onPress, variant = 'secondary', style }: ActionButtonProps): React.JSX.Element => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.text, variant === 'primary' ? styles.primaryText : styles.secondaryText]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  secondary: {
    backgroundColor: '#111827',
    borderColor: '#374151',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  primaryText: {
    color: '#EFF6FF',
  },
  secondaryText: {
    color: '#D1D5DB',
  },
  pressed: {
    opacity: 0.85,
  },
});

export default ActionButton;
