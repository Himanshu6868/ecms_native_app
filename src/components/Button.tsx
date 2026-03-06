import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  style?: ViewStyle;
};

const Button = ({ title, onPress, variant = 'primary', style }: ButtonProps): React.JSX.Element => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'primary' && styles.primaryLabel,
          variant === 'secondary' && styles.secondaryLabel,
          variant === 'danger' && styles.dangerLabel,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  primary: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  secondary: {
    backgroundColor: '#111827',
    borderColor: '#374151',
  },
  danger: {
    backgroundColor: '#DC2626',
    borderColor: '#EF4444',
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  primaryLabel: {
    color: '#FFFFFF',
  },
  secondaryLabel: {
    color: '#E5E7EB',
  },
  dangerLabel: {
    color: '#FFFFFF',
  },
});

export default Button;
