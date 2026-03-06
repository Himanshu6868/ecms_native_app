import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const DashboardScreen = (): React.JSX.Element => {
  return (
    <View style={styles.container}>
      <Text style={styles.badge}>ECMS DASHBOARD</Text>
      <Text style={styles.title}>You are signed in</Text>
      <Text style={styles.subtitle}>
        This is a placeholder dashboard to complete the navigation flow for this UI-only authentication demo.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  badge: {
    color: '#93C5FD',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#1E3A8A',
    backgroundColor: '#0B2948',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});

export default DashboardScreen;
