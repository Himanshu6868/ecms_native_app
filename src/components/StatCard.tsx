import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type StatCardProps = {
  title: string;
  value: string | number;
  caption: string;
};

const StatCard = ({ title, value, caption }: StatCardProps): React.JSX.Element => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderColor: '#1F2937',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    minHeight: 115,
    justifyContent: 'space-between',
    flexBasis: '31%',
    flexGrow: 1,
  },
  title: {
    color: '#9CA3AF',
    fontSize: 11,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  value: {
    color: '#F9FAFB',
    fontSize: 30,
    fontWeight: '700',
    marginVertical: 6,
  },
  caption: {
    color: '#6B7280',
    fontSize: 12,
  },
});

export default StatCard;
