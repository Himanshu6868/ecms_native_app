import type { UserRole } from './authService';

export const canCreateUsers = (role: UserRole | null): boolean => role === 'super_admin';

export const canAccessInternalApp = (role: UserRole | null): boolean =>
  role === 'internal_support' || role === 'admin' || role === 'super_admin';

export const canViewAllTickets = (role: UserRole | null): boolean => canAccessInternalApp(role);

export const canUpdateTicketStatus = (role: UserRole | null): boolean => role === 'admin' || role === 'super_admin';

export const canCreateTickets = (role: UserRole | null): boolean => role === 'customer';
