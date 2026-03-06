import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Badge from '../components/Badge';
import TicketCard, { Ticket } from '../components/TicketCard';

const currentUserEmail = 'support.member1.demo@gmail.com';

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
    status: 'OPEN',
    priority: 'CRITICAL',
    assignedTo: 'support.member1.demo@gmail.com',
  },
  {
    id: '#aa9123de',
    status: 'OPEN',
    priority: 'HIGH',
    assignedTo: 'support.member1.demo@gmail.com',
  },
];

const MyTicketsScreen = (): React.JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');

  const assignedTickets = useMemo(
    () => tickets.filter((ticket) => ticket.assignedTo === currentUserEmail),
    [],
  );

  const filteredTickets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return assignedTickets;
    }

    return assignedTickets.filter(
      (ticket) => ticket.id.toLowerCase().includes(query) || ticket.status.toLowerCase().includes(query),
    );
  }, [assignedTickets, searchQuery]);

  return (
    <View style={styles.screen}>
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.title}>My Tickets</Text>
          <Text style={styles.subtitle}>Tickets currently assigned to you</Text>
        </View>
        <Badge label="3 Active" variant="active" />
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

        <View style={styles.chipsWrap}>
          <Badge label="All" variant="active" />
          <Badge label="Open" variant="neutral" />
          <Badge label="High Priority" variant="neutral" />
          <Badge label="Critical" variant="neutral" />
        </View>
      </View>

      <FlatList
        data={filteredTickets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TicketCard ticket={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="ticket-outline" size={42} color="#6B7280" />
            <Text style={styles.emptyText}>No tickets assigned to you</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
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
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
