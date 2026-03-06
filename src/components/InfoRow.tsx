import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type InfoRowProps = {
  label: string;
  value: string;
};

const InfoRow = ({ label, value }: InfoRowProps): React.JSX.Element => {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#1F2937',
    borderBottomWidth: 1,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  value: {
    color: '#F3F4F6',
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
});

export default InfoRow;
