/**
 * Centralized Supabase Client for Zain Education Center Management System
 * (نظام زين لإدارة الدروس والسناتر - طبقة الاتصال بـ Supabase)
 *
 * Security & Architecture rules:
 * 1. Only public frontend-safe Anon Key and Project URL are used.
 * 2. NEVER expose the Service Role or Secret key in frontend code.
 * 3. Gracefully handles missing environment variables with zero White Screen risk.
 * 4. Compatible with older browsers and ES2015 runtimes.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Safe environment variable reading
const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : null;

const rawSupabaseUrl: string =
  metaEnv && metaEnv.VITE_SUPABASE_URL
    ? String(metaEnv.VITE_SUPABASE_URL).trim()
    : '';

const rawSupabaseAnonKey: string =
  metaEnv && metaEnv.VITE_SUPABASE_ANON_KEY
    ? String(metaEnv.VITE_SUPABASE_ANON_KEY).trim()
    : '';

// Verification of configuration
export const isSupabaseConfigured = Boolean(
  rawSupabaseUrl &&
    rawSupabaseUrl.startsWith('http') &&
    rawSupabaseAnonKey &&
    rawSupabaseAnonKey.length > 10
);

// Fallback placeholder URL that is structurally valid so createClient doesn't throw at initialization
const safeUrl = isSupabaseConfigured
  ? rawSupabaseUrl
  : 'https://placeholder.supabase.co';

const safeAnonKey = isSupabaseConfigured
  ? rawSupabaseAnonKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

// Single centralized client instance
export const supabase: SupabaseClient = createClient(safeUrl, safeAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export interface ConnectionTestResult {
  status: 'connected' | 'unconfigured' | 'error';
  message: string;
  isConfigured: boolean;
  projectUrl: string;
  latencyMs?: number;
  timestamp: string;
}

/**
 * Diagnostic function to test connection with the Supabase backend.
 * Safely catches all network and runtime errors to guarantee zero White Screen.
 */
export async function checkSupabaseConnection(): Promise<ConnectionTestResult> {
  const now = new Date().toLocaleTimeString('ar-EG');

  if (!isSupabaseConfigured) {
    return {
      status: 'unconfigured',
      message: 'بيانات الاتصال بـ Supabase (VITE_SUPABASE_URL) لم تُعيّن بعد. يعمل النظام حاليًا في نمط الذاكرة الآمن (Safe Fallback).',
      isConfigured: false,
      projectUrl: rawSupabaseUrl || 'غير محدد',
      timestamp: now,
    };
  }

  const startTime = Date.now();
  try {
    // Attempt a lightweight ping or head request to test connectivity
    // Note: Tables might not exist yet in Phase 3, which is expected.
    const { error } = await supabase
      .from('students')
      .select('id', { head: true, count: 'exact' });

    const latencyMs = Date.now() - startTime;

    if (error) {
      // Postgres error 42P01 means table does not exist yet, which proves Supabase is reachable and responding!
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          status: 'connected',
          message: 'تم الاتصال بخادم Supabase بنجاح! قاعدة البيانات جاهزة لاستقبال الجداول في المرحلة القادمة.',
          isConfigured: true,
          projectUrl: rawSupabaseUrl,
          latencyMs,
          timestamp: now,
        };
      }

      // If it's another API error (e.g. invalid API key)
      return {
        status: 'error',
        message: `استجاب خادم Supabase مع تنبيه: ${error.message || error.code}`,
        isConfigured: true,
        projectUrl: rawSupabaseUrl,
        latencyMs,
        timestamp: now,
      };
    }

    return {
      status: 'connected',
      message: 'تم الاتصال بقاعدة بيانات Supabase بنجاح تام وسرعة استجابة ممتازة.',
      isConfigured: true,
      projectUrl: rawSupabaseUrl,
      latencyMs,
      timestamp: now,
    };
  } catch (err: any) {
    return {
      status: 'error',
      message: `تعذر الاتصال بـ Supabase: ${err && err.message ? err.message : 'خطأ غير متوقع في الشبكة'}`,
      isConfigured: true,
      projectUrl: rawSupabaseUrl,
      timestamp: now,
    };
  }
}
