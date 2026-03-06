import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'active' | 'assigned';

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
};

const variantStyles: Record<BadgeVariant, { backgroundColor: string; color: string; borderColor: string }> = {
  neutral: { backgroundColor: '#1F2937', color: '#D1D5DB', borderColor: '#374151' },
  success: { backgroundColor: '#052E22', color: '#6EE7B7', borderColor: '#064E3B' },
  warning: { backgroundColor: '#3F2A07', color: '#FCD34D', borderColor: '#6B4F12' },
  danger: { backgroundColor: '#3B0A13', color: '#FDA4AF', borderColor: '#7F1D1D' },
  info: { backgroundColor: '#0A2E45', color: '#7DD3FC', borderColor: '#164E63' },
  active: { backgroundColor: '#1D4ED8', color: '#DBEAFE', borderColor: '#2563EB' },
  assigned: { backgroundColor: '#2E1065', color: '#DDD6FE', borderColor: '#5B21B6' },
};

const Badge = ({ label, variant = 'neutral' }: BadgeProps): React.JSX.Element => {
  const selected = variantStyles[variant];

  return (
    <View style={[styles.badge, { backgroundColor: selected.backgroundColor, borderColor: selected.borderColor }]}>
      <Text style={[styles.text, { color: selected.color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});

export default Badge;
