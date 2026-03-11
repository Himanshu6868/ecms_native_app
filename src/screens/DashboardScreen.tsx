import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';

import ActionButton from '../components/ActionButton';
import Badge from '../components/Badge';
import StatCard from '../components/StatCard';
import { firestore } from '../services/firebase/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { canUpdateTicketStatus } from '../services/auth/authorization';

type TicketStatus = 'OPEN' | 'CLOSED' | 'ASSIGNED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

type Ticket = {
  id: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: string;
};

const TICKETS_COLLECTION = 'tickets';

const normalizeStatus = (status: unknown): TicketStatus => {
  if (status === 'CLOSED' || status === 'ASSIGNED' || status === 'OPEN') {
    return status;
  }

  return 'OPEN';
};

const normalizePriority = (priority: unknown): TicketPriority => {
  if (priority === 'LOW' || priority === 'MEDIUM' || priority === 'HIGH' || priority === 'CRITICAL') {
    return priority;
  }

  return 'LOW';
};

const DashboardScreen = (): React.JSX.Element => {
  const { role } = useAuthStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ticketsQuery = query(collection(firestore, TICKETS_COLLECTION), orderBy('createdAt', 'desc'), limit(20));

    const unsubscribe = onSnapshot(
      ticketsQuery,
      (snapshot) => {
        const nextTickets: Ticket[] = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data();

          return {
            id: `#${docSnapshot.id}`,
            status: normalizeStatus(data.status),
            priority: normalizePriority(data.priority),
            assignedTo: typeof data.assignedTo === 'string' && data.assignedTo.trim() ? data.assignedTo : 'Unassigned',
          };
        });

        setTickets(nextTickets);
        setIsLoading(false);
      },
      () => {
        setTickets([]);
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const filteredTickets = useMemo(() => {
    const queryText = searchQuery.trim().toLowerCase();

    if (!queryText) {
      return tickets;
    }

    return tickets.filter(
      (ticket) =>
        ticket.id.toLowerCase().includes(queryText) ||
        ticket.status.toLowerCase().includes(queryText) ||
        ticket.priority.toLowerCase().includes(queryText) ||
        ticket.assignedTo.toLowerCase().includes(queryText),
    );
  }, [searchQuery, tickets]);

  const renderStatusBadge = (status: Ticket['status']) => (
    <Badge label={status} variant={status === 'ASSIGNED' ? 'info' : status === 'OPEN' ? 'assigned' : 'success'} />
  );

  const renderPriorityBadge = (priority: Ticket['priority']) => {
    if (priority === 'CRITICAL') {
      return <Badge label={priority} variant="danger" />;
    }

    if (priority === 'HIGH') {
      return <Badge label={priority} variant="warning" />;
    }

    if (priority === 'MEDIUM') {
      return <Badge label={priority} variant="info" />;
    }

    return <Badge label={priority} variant="neutral" />;
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.appTitle}>ECMS Console</Text>
          <Text style={styles.subtitle}>Enterprise Case Management</Text>
          <Text style={styles.roleLabel}>Role: {(role ?? 'internal_support').toUpperCase()}</Text>
        </View>
        <View style={styles.liveQueueBadge}>
          <Text style={styles.liveQueueText}>Live queue: last 20 tickets</Text>
        </View>
      </View>

      <View style={styles.statsWrap}>
        <StatCard title="TOTAL TICKETS" value={tickets.length} caption="Across your scoped queue" />
        <StatCard
          title="OPEN WORKLOAD"
          value={tickets.filter((ticket) => ticket.status === 'OPEN' || ticket.status === 'ASSIGNED').length}
          caption="Active operational demand"
        />
        <StatCard
          title="HIGH PRIORITY"
          value={tickets.filter((ticket) => ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL').length}
          caption="Needs immediate action"
        />
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.searchBarWrap}>
          <Ionicons name="search" size={16} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
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
        {isLoading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator color="#60A5FA" />
            <Text style={styles.stateText}>Loading tickets...</Text>
          </View>
        ) : filteredTickets.length === 0 ? (
          <View style={styles.centeredState}>
            <Ionicons name="ticket-outline" size={30} color="#6B7280" />
            <Text style={styles.stateText}>No tickets found</Text>
          </View>
        ) : (
          filteredTickets.map((ticket) => (
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

              {canUpdateTicketStatus(role) ? (
                <View style={styles.updateRow}>
                  <View style={styles.dropdownMock}>
                    <Text style={styles.dropdownText}>Select status</Text>
                    <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
                  </View>
                  <ActionButton title="Update" variant="primary" style={styles.updateButton} />
                </View>
              ) : null}
            </View>
          ))
        )}
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
  centeredState: {
    minHeight: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
    backgroundColor: '#0B1220',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  stateText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
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
