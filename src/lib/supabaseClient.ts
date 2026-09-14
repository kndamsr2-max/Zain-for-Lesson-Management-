/**
 * Centralized Supabase Client for Zain Education Center Management System
 * (نظام زين لإدارة الدروس والسناتر - طبقة الاتصال بـ Supabase)
 *
 * Security & Architecture rules:
 * 1. Environment variables from Vercel / Vite (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
 *    are the PRIMARY bootstrap source.
 * 2. Dynamic client recreation allows testing and applying credentials from Settings UI
 *    with immediate verification and reactive reload.
 * 3. NEVER expose the Service Role or Secret key in frontend code.
 * 4. Zero White Screen risk with comprehensive connection diagnostics.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Safe environment variable reading from Vercel / Vite
const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : null;

const envUrl: string =
  metaEnv && metaEnv.VITE_SUPABASE_URL
    ? String(metaEnv.VITE_SUPABASE_URL).trim()
    : '';

const envAnonKey: string =
  metaEnv && metaEnv.VITE_SUPABASE_ANON_KEY
    ? String(metaEnv.VITE_SUPABASE_ANON_KEY).trim()
    : '';

// Active in-memory or custom configured endpoints
let activeUrl = envUrl;
let activeAnonKey = envAnonKey;

// Validation helper
export function validateSupabaseCredentials(url: string, anonKey: string): {
  isValid: boolean;
  reason?: string;
} {
  const cleanUrl = (url || '').trim();
  const cleanKey = (anonKey || '').trim();

  if (!cleanUrl) {
    return { isValid: false, reason: 'رابط Supabase URL غير موجود.' };
  }
  if (!cleanUrl.startsWith('https://') && !cleanUrl.startsWith('http://')) {
    return { isValid: false, reason: 'رابط Supabase يجب أن يبدأ بـ https://' };
  }
  if (!cleanKey) {
    return { isValid: false, reason: 'مفتاح Supabase Anon Key غير موجود.' };
  }
  if (cleanKey.length < 20) {
    return { isValid: false, reason: 'مفتاح Supabase Anon Key قصير جداً أو غير صالح.' };
  }
  return { isValid: true };
}

export function getIsConfigured(): boolean {
  return validateSupabaseCredentials(activeUrl, activeAnonKey).isValid;
}

export let isSupabaseConfigured = getIsConfigured();

// Fallback placeholder URL that is structurally valid so createClient doesn't throw at initialization
const safeUrl = isSupabaseConfigured
  ? activeUrl
  : 'https://placeholder.supabase.co';

const safeAnonKey = isSupabaseConfigured
  ? activeAnonKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

// Single centralized client instance
export let supabase: SupabaseClient = createClient(safeUrl, safeAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

/**
 * Re-configures the active Supabase client dynamically without page reload.
 */
export function reconfigureSupabaseClient(newUrl: string, newAnonKey: string): boolean {
  const validation = validateSupabaseCredentials(newUrl, newAnonKey);
  if (!validation.isValid) {
    return false;
  }

  activeUrl = newUrl.trim();
  activeAnonKey = newAnonKey.trim();
  isSupabaseConfigured = true;

  supabase = createClient(activeUrl, activeAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });

  return true;
}

export function getCurrentConfig(): {
  url: string;
  anonKey: string;
  isEnvConfigured: boolean;
} {
  return {
    url: activeUrl,
    anonKey: activeAnonKey,
    isEnvConfigured: Boolean(envUrl && envAnonKey),
  };
}

export interface ConnectionTestResult {
  status: 'connected' | 'unconfigured' | 'error';
  message: string;
  isConfigured: boolean;
  projectUrl: string;
  latencyMs?: number;
  timestamp: string;
  errorDetail?: string;
}

/**
 * Diagnostic function to test connection with the Supabase backend.
 * Safely catches all network and runtime errors to guarantee zero White Screen.
 */
export async function checkSupabaseConnection(
  customUrl?: string,
  customKey?: string
): Promise<ConnectionTestResult> {
  const now = new Date().toLocaleTimeString('ar-EG');
  const targetUrl = customUrl !== undefined ? customUrl.trim() : activeUrl;
  const targetKey = customKey !== undefined ? customKey.trim() : activeAnonKey;

  const validation = validateSupabaseCredentials(targetUrl, targetKey);
  if (!validation.isValid) {
    return {
      status: 'unconfigured',
      message: validation.reason || 'بيانات الاتصال بـ Supabase لم تُعيّن بعد.',
      isConfigured: false,
      projectUrl: targetUrl || 'غير محدد',
      timestamp: now,
    };
  }

  const startTime = Date.now();
  try {
    const testClient =
      customUrl && customKey
        ? createClient(targetUrl, targetKey, { auth: { persistSession: false } })
        : supabase;

    // Head request to students table
    const { error } = await testClient
      .from('students')
      .select('id', { head: true, count: 'exact' });

    const latencyMs = Date.now() - startTime;

    if (error) {
      // Postgres error 42P01 means table does not exist yet, which proves Supabase is reachable and responding!
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          status: 'connected',
          message: 'تم الاتصال بخادم Supabase بنجاح! الخادم متصل وقاعدة البيانات تستجيب.',
          isConfigured: true,
          projectUrl: targetUrl,
          latencyMs,
          timestamp: now,
        };
      }

      // If invalid API key or bad credentials
      if (error.code === 'PGRST301' || error.message?.toLowerCase().includes('jwt') || error.message?.toLowerCase().includes('apikey')) {
        return {
          status: 'error',
          message: 'فشل المصادقة: مفتاح Supabase Anon Key غير صحيح أو منتهي الصلاحية.',
          isConfigured: true,
          projectUrl: targetUrl,
          latencyMs,
          timestamp: now,
          errorDetail: error.message,
        };
      }

      return {
        status: 'error',
        message: `استجاب خادم Supabase بتنبيه: ${error.message || error.code}`,
        isConfigured: true,
        projectUrl: targetUrl,
        latencyMs,
        timestamp: now,
        errorDetail: error.message,
      };
    }

    return {
      status: 'connected',
      message: 'تم الاتصال بقاعدة بيانات Supabase بنجاح تام وبسرعة استجابة ممتازة.',
      isConfigured: true,
      projectUrl: targetUrl,
      latencyMs,
      timestamp: now,
    };
  } catch (err: any) {
    const isNetwork =
      err?.message?.includes('Failed to fetch') ||
      err?.message?.includes('NetworkError') ||
      err?.name === 'TypeError';

    return {
      status: 'error',
      message: isNetwork
        ? 'تعذر الوصول إلى خادم Supabase. يرجى التأكد من صحة الرابط والاتصال بالإنترنت.'
        : `خطأ أثناء فحص الاتصال: ${err?.message || 'خطأ غير معروف'}`,
      isConfigured: true,
      projectUrl: targetUrl,
      timestamp: now,
      errorDetail: err?.message,
    };
  }
}
