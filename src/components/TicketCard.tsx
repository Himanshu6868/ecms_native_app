import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Badge from './Badge';
import Button from './Button';

export type TicketStatus = 'OPEN' | 'ASSIGNED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type Ticket = {
  id: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: string;
  title?: string;
  description?: string;
  category?: string;
};

type TicketCardProps = {
  ticket: Ticket;
  canUpdateStatus?: boolean;
};

const statusVariantMap: Record<TicketStatus, 'success' | 'assigned' | 'neutral'> = {
  OPEN: 'success',
  ASSIGNED: 'assigned',
  CLOSED: 'neutral',
};

const priorityVariantMap: Record<TicketPriority, 'neutral' | 'info' | 'warning' | 'danger'> = {
  LOW: 'neutral',
  MEDIUM: 'info',
  HIGH: 'warning',
  CRITICAL: 'danger',
};

const TicketCard = ({ ticket, canUpdateStatus = false }: TicketCardProps): React.JSX.Element => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.ticketId}>{ticket.id.toUpperCase()}</Text>
        <Badge label={ticket.status} variant={statusVariantMap[ticket.status]} />
      </View>

      <Text style={styles.title}>{ticket.title ?? 'Untitled ticket'}</Text>

      <View style={styles.rowStart}>
        <Badge label={ticket.priority} variant={priorityVariantMap[ticket.priority]} />
      </View>

      <View style={styles.assignedWrap}>
        <Text style={styles.assignedLabel}>Assigned to:</Text>
        <Text style={styles.assignedValue}>{ticket.assignedTo}</Text>
      </View>

      <View style={styles.buttonRow}>
        <Button title="Details" variant="secondary" style={styles.flexButton} onPress={() => setIsDetailsVisible(true)} />
        <Button title="Chat" variant="secondary" style={styles.flexButton} onPress={() => undefined} />
      </View>

      {canUpdateStatus ? (
        <View style={styles.updateRow}>
          <View style={styles.dropdownMock}>
            <Text style={styles.dropdownText}>Select status</Text>
            <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
          </View>
          <Button title="Update" style={styles.updateButton} onPress={() => undefined} />
        </View>
      ) : null}

      <Modal visible={isDetailsVisible} transparent animationType="fade" onRequestClose={() => setIsDetailsVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.modalTitle}>{ticket.id.toUpperCase()}</Text>
              <Pressable onPress={() => setIsDetailsVisible(false)}>
                <Ionicons name="close" size={20} color="#D1D5DB" />
              </Pressable>
            </View>
            <Text style={styles.modalText}>Title: {ticket.title ?? 'Untitled ticket'}</Text>
            <Text style={styles.modalText}>Category: {ticket.category ?? 'General'}</Text>
            <Text style={styles.modalText}>Priority: {ticket.priority}</Text>
            <Text style={styles.modalText}>Status: {ticket.status}</Text>
            <Text style={styles.modalText}>Assigned to: {ticket.assignedTo}</Text>
            <Text style={styles.modalText}>Description:</Text>
            <Text style={styles.modalDescription}>{ticket.description ?? 'No description provided.'}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0B1220',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 14,
    gap: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  rowStart: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketId: {
    color: '#F3F4F6',
    fontSize: 15,
    fontWeight: '700',
  },
  title: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '500',
  },
  assignedWrap: {
    gap: 2,
  },
  assignedLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  assignedValue: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '500',
  },
  buttonRow: {
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
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 10,
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  updateButton: {
    minWidth: 96,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#0B1220',
    borderColor: '#1F2937',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  modalTitle: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '700',
  },
  modalText: {
    color: '#D1D5DB',
    fontSize: 13,
  },
  modalDescription: {
    color: '#E5E7EB',
    fontSize: 13,
    lineHeight: 18,
  },
});

export default TicketCard;
