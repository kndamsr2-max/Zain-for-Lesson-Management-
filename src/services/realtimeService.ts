/**
 * Centralized Realtime Subscription Manager for Zain Center
 * (اشتراكات التحديث اللحظي لـ Supabase لضمان مزامنة البيانات عبر عدة أجهزة دون تكرار أو تسريب قنوات)
 */

import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface TableChangePayload {
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  newRecord: any;
  oldRecord: any;
}

export interface RealtimeHandlers {
  onStudentsChange?: (payload: TableChangePayload) => void;
  onGroupsChange?: (payload: TableChangePayload) => void;
  onPaymentsChange?: (payload: TableChangePayload) => void;
  onAttendanceChange?: (payload: TableChangePayload) => void;
  onSessionsChange?: (payload: TableChangePayload) => void;
  onStatusChange?: (
    status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'ERROR',
    message?: string
  ) => void;
}

let activeChannel: RealtimeChannel | null = null;
let reconnectTimer: any = null;

/**
 * Unified Realtime synchronization across all core tables on a single channel.
 * Eliminates duplicate subscriptions, handles channel status, and manages clean unsubscription.
 */
export function setupRealtimeSync(handlers: RealtimeHandlers): () => void {
  if (!isSupabaseConfigured) {
    return () => {};
  }

  // Safely tear down existing channel if any to prevent duplicate subscriptions
  if (activeChannel) {
    try {
      supabase.removeChannel(activeChannel);
    } catch {
      // ignore
    }
    activeChannel = null;
  }

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  try {
    const channelName = `zain_central_sync_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        (payload: any) => {
          handlers.onStudentsChange?.({
            table: 'students',
            eventType: payload.eventType,
            newRecord: payload.new,
            oldRecord: payload.old,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'groups' },
        (payload: any) => {
          handlers.onGroupsChange?.({
            table: 'groups',
            eventType: payload.eventType,
            newRecord: payload.new,
            oldRecord: payload.old,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        (payload: any) => {
          handlers.onPaymentsChange?.({
            table: 'payments',
            eventType: payload.eventType,
            newRecord: payload.new,
            oldRecord: payload.old,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance' },
        (payload: any) => {
          handlers.onAttendanceChange?.({
            table: 'attendance',
            eventType: payload.eventType,
            newRecord: payload.new,
            oldRecord: payload.old,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions' },
        (payload: any) => {
          handlers.onSessionsChange?.({
            table: 'sessions',
            eventType: payload.eventType,
            newRecord: payload.new,
            oldRecord: payload.old,
          });
        }
      )
      .subscribe((status: string, err?: any) => {
        if (status === 'SUBSCRIBED') {
          handlers.onStatusChange?.('CONNECTED');
        } else if (
          status === 'CHANNEL_ERROR' ||
          status === 'TIMED_OUT' ||
          status === 'CLOSED'
        ) {
          handlers.onStatusChange?.(
            'DISCONNECTED',
            err?.message || 'انقطع الاتصال اللحظي بخادم المزامنة'
          );

          // Automatically schedule reconnection
          if (!reconnectTimer) {
            reconnectTimer = setTimeout(() => {
              reconnectTimer = null;
              handlers.onStatusChange?.('RECONNECTING');
              setupRealtimeSync(handlers);
            }, 4000);
          }
        }
      });

    activeChannel = channel;

    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (activeChannel) {
        supabase.removeChannel(activeChannel);
        activeChannel = null;
      }
    };
  } catch (err: any) {
    console.warn('[Realtime] Failed to initialize subscription:', err);
    handlers.onStatusChange?.('ERROR', err?.message);
    return () => {};
  }
}

export type RealtimeChangeCallback = (payload: {
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  newRecord: any;
  oldRecord: any;
}) => void;

/**
 * Backward compatibility function for single table subscription
 */
export function subscribeToTableChanges(
  tableName: 'students' | 'groups' | 'attendance' | 'payments' | 'sessions',
  onNotification: RealtimeChangeCallback
) {
  if (!isSupabaseConfigured) {
    return () => {};
  }

  try {
    const channel = supabase
      .channel(`realtime_${tableName}_channel_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
        },
        (payload: any) => {
          onNotification({
            table: tableName,
            eventType: payload.eventType,
            newRecord: payload.new,
            oldRecord: payload.old,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn(`[Realtime] Failed to subscribe to ${tableName}:`, err);
    return () => {};
  }
}

