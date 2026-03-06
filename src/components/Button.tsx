import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'text';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

const Button = ({
  title,
  onPress,
  variant = 'primary',
  style,
  disabled = false,
}: ButtonProps): React.JSX.Element => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        variant === 'text' && styles.text,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'primary' && styles.primaryLabel,
          variant === 'secondary' && styles.secondaryLabel,
          variant === 'danger' && styles.dangerLabel,
          variant === 'text' && styles.textLabel,
          disabled && styles.disabledLabel,
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
  text: {
    minHeight: 36,
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
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
  textLabel: {
    color: '#93C5FD',
    fontWeight: '600',
  },
  disabledLabel: {
    color: '#CBD5E1',
  },
});

export default Button;
