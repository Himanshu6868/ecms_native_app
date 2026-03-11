import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';

import Badge from '../components/Badge';
import TicketCard, { Ticket } from '../components/TicketCard';
import { firestore } from '../services/firebase/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { canViewAllTickets } from '../services/auth/authorization';

const TICKETS_COLLECTION = 'tickets';

const normalizeTicket = (id: string, data: Record<string, unknown>): Ticket => ({
  id: `#${id}`,
  status: data.status === 'CLOSED' || data.status === 'ASSIGNED' ? data.status : 'OPEN',
  priority:
    data.priority === 'LOW' || data.priority === 'MEDIUM' || data.priority === 'HIGH' || data.priority === 'CRITICAL'
      ? data.priority
      : 'LOW',
  assignedTo: typeof data.assignedTo === 'string' && data.assignedTo.trim() ? data.assignedTo : 'Unassigned',
});

const MyTicketsScreen = (): React.JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authUserId, role } = useAuthStore();

  useEffect(() => {
    if (!authUserId) {
      setTickets([]);
      setIsLoading(false);
      return;
    }

    const baseRef = collection(firestore, TICKETS_COLLECTION);
    const ticketsQuery = canViewAllTickets(role)
      ? query(baseRef, orderBy('createdAt', 'desc'))
      : query(baseRef, where('createdBy', '==', authUserId), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      ticketsQuery,
      (snapshot) => {
        const nextTickets = snapshot.docs.map((docSnapshot) => normalizeTicket(docSnapshot.id, docSnapshot.data()));
        setTickets(nextTickets);
        setIsLoading(false);
      },
      () => {
        setTickets([]);
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [authUserId, role]);

  const filteredTickets = useMemo(() => {
    const queryText = searchQuery.trim().toLowerCase();

    if (!queryText) {
      return tickets;
    }

    return tickets.filter(
      (ticket) => ticket.id.toLowerCase().includes(queryText) || ticket.status.toLowerCase().includes(queryText),
    );
  }, [searchQuery, tickets]);

  return (
    <View style={styles.screen}>
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.title}>{canViewAllTickets(role) ? 'Ticket Management' : 'My Tickets'}</Text>
          <Text style={styles.subtitle}>
            {canViewAllTickets(role) ? 'Operational visibility across all tickets' : 'Tickets created by your account'}
          </Text>
        </View>
        <Badge label={`${tickets.length} Total`} variant="active" />
      </View>

      <View style={styles.filterCard}>
        <View style={styles.searchBarWrap}>
          <Ionicons name="search" size={16} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by ticket ID or status"
            placeholderTextColor="#6B7280"
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Loading tickets...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTickets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TicketCard ticket={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="ticket-outline" size={42} color="#6B7280" />
              <Text style={styles.emptyText}>{canViewAllTickets(role) ? 'No tickets found' : 'No tickets created by you'}</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#030712',
    padding: 16,
    gap: 12,
  },
  headerCard: {
    backgroundColor: '#0B1220',
    borderColor: '#1F2937',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 2,
    color: '#9CA3AF',
    fontSize: 13,
  },
  filterCard: {
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
    fontSize: 13,
    paddingVertical: 10,
  },
  listContent: {
    gap: 10,
    paddingBottom: 24,
  },
  emptyWrap: {
    marginTop: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default MyTicketsScreen;
