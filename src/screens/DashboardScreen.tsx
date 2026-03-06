import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ActionButton from '../components/ActionButton';
import Badge from '../components/Badge';
import StatCard from '../components/StatCard';

type Ticket = {
  id: string;
  status: 'CLOSED' | 'ASSIGNED';
  priority: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedTo: string;
};

const tickets: Ticket[] = [
  {
    id: '#f0472021',
    status: 'CLOSED',
    priority: 'MEDIUM',
    assignedTo: 'support.member2.demo@gmail.com',
  },
  {
    id: '#4f13f34b',
    status: 'ASSIGNED',
    priority: 'HIGH',
    assignedTo: 'super.admin1.demo@gmail.com',
  },
  {
    id: '#bc054a70',
    status: 'CLOSED',
    priority: 'CRITICAL',
    assignedTo: 'support.member1.demo@gmail.com',
  },
];

const DashboardScreen = (): React.JSX.Element => {
  const renderStatusBadge = (status: Ticket['status']) => (
    <Badge label={status} variant={status === 'ASSIGNED' ? 'info' : 'success'} />
  );

  const renderPriorityBadge = (priority: Ticket['priority']) => {
    if (priority === 'CRITICAL') {
      return <Badge label={priority} variant="danger" />;
    }

    if (priority === 'HIGH') {
      return <Badge label={priority} variant="warning" />;
    }

    return <Badge label={priority} variant="neutral" />;
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.appTitle}>ECMS Console</Text>
          <Text style={styles.subtitle}>Enterprise Case Management</Text>
          <Text style={styles.roleLabel}>Role: ADMIN</Text>
        </View>
        <View style={styles.liveQueueBadge}>
          <Text style={styles.liveQueueText}>Live queue: last 20 tickets</Text>
        </View>
      </View>

      <View style={styles.statsWrap}>
        <StatCard title="TOTAL TICKETS" value={6} caption="Across your scoped queue" />
        <StatCard title="OPEN WORKLOAD" value={4} caption="Active operational demand" />
        <StatCard title="HIGH PRIORITY" value={4} caption="Needs immediate action" />
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.searchBarWrap}>
          <Ionicons name="search" size={16} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tickets by ID, status, priority..."
            placeholderTextColor="#6B7280"
          />
        </View>

        <View style={styles.filterRow}>
          <View style={styles.chipsWrap}>
            <Badge label="All" variant="active" />
            <Badge label="Open" variant="neutral" />
            <Badge label="High Priority" variant="neutral" />
            <Badge label="Assigned to Me" variant="neutral" />
          </View>
          <ActionButton title="Apply" variant="primary" style={styles.applyButton} />
        </View>
      </View>

      <View style={styles.ticketListHeader}>
        <Text style={styles.sectionTitle}>Ticket Queue</Text>
        <View style={styles.ticketTabs}>
          <Badge label="All Tickets" variant="active" />
          <Badge label="Assigned to Me" variant="neutral" />
        </View>
      </View>

      <View style={styles.ticketList}>
        {tickets.map((ticket) => (
          <View key={ticket.id} style={styles.ticketCard}>
            <View style={styles.ticketRowSpaceBetween}>
              <Text style={styles.ticketId}>{ticket.id}</Text>
              {renderStatusBadge(ticket.status)}
            </View>

            <View style={styles.ticketRowSpaceBetween}>
              {renderPriorityBadge(ticket.priority)}
              <Text style={styles.assignedTo}>{ticket.assignedTo}</Text>
            </View>

            <View style={styles.actionsRow}>
              <ActionButton title="Details" style={styles.flexButton} />
              <ActionButton title="Chat" style={styles.flexButton} />
            </View>

            <View style={styles.updateRow}>
              <View style={styles.dropdownMock}>
                <Text style={styles.dropdownText}>Select status</Text>
                <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
              </View>
              <ActionButton title="Update" variant="primary" style={styles.updateButton} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#030712',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
    gap: 14,
  },
  headerRow: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    backgroundColor: '#0B1220',
    padding: 14,
    gap: 8,
  },
  headerTextWrap: {
    gap: 4,
  },
  appTitle: {
    color: '#F9FAFB',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  roleLabel: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '600',
  },
  liveQueueBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0B2948',
    borderWidth: 1,
    borderColor: '#1E3A8A',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  liveQueueText: {
    color: '#93C5FD',
    fontWeight: '600',
    fontSize: 12,
  },
  statsWrap: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  sectionCard: {
    backgroundColor: '#0B1220',
    borderColor: '#1F2937',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  searchBarWrap: {
    borderColor: '#1F2937',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#E5E7EB',
    paddingVertical: 10,
    fontSize: 13,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  applyButton: {
    minWidth: 70,
  },
  ticketListHeader: {
    gap: 8,
  },
  sectionTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '700',
  },
  ticketTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  ticketList: {
    gap: 10,
  },
  ticketCard: {
    backgroundColor: '#0B1220',
    borderColor: '#1F2937',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  ticketRowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  ticketId: {
    color: '#F3F4F6',
    fontSize: 16,
    fontWeight: '700',
  },
  assignedTo: {
    color: '#9CA3AF',
    fontSize: 12,
    flexShrink: 1,
    textAlign: 'right',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  flexButton: {
    flex: 1,
  },
  updateRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dropdownMock: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#111827',
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  updateButton: {
    minWidth: 90,
  },
});

export default DashboardScreen;
