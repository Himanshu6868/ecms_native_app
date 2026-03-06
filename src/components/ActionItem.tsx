import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ActionItemProps = {
  title: string;
  onPress?: () => void;
};

const ActionItem = ({ title, onPress }: ActionItemProps): React.JSX.Element => {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.iconWrap}>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  item: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.8,
  },
  title: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
  },
  iconWrap: {
    width: 24,
    alignItems: 'flex-end',
  },
});

export default ActionItem;
