/**
 * @file Hook for managing employee work sessions.
 * Provides live timer, session state, and actions for clock-in/out/break/resume.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface SessionBreak {
  id: string;
  type: string;
  slotName: string | null;
  sortOrder: number;
  startedAt: string;
  endedAt: string | null;
  durationMin: number | null;
}

export interface WorkSessionData {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  status: 'ACTIVE' | 'ON_BREAK' | 'COMPLETED';
  totalWorkMin: number;
  totalBreakMin: number;
  isLate: boolean;
  lateMinutes: number;
  isOvertime: boolean;
  overtimeMin: number;
  breaks: SessionBreak[];
}

export interface BreakSlot {
  id: string;
  name: string;
  type: string;
  startTime: string;
  endTime: string;
  durationMin: number;
  sortOrder: number;
  isRequired: boolean;
}

export interface BreakPolicy {
  id: string;
  mode: 'FIXED' | 'FLEXIBLE' | 'NONE';
  totalBreakMin: number;
  breakSlots: BreakSlot[];
}

export interface SessionAnalytics {
  totalDays: number;
  totalWorkMin: number;
  totalBreakMin: number;
  lateDays: number;
  totalLateMin: number;
  overtimeDays: number;
  totalOvertimeMin: number;
  salaryDaySystem: number;
  absentDays: number;
  attendanceRate: number;
}

export function useWorkSession() {
  const [session, setSession] = useState<WorkSessionData | null>(null);
  const [breakPolicy, setBreakPolicy] = useState<BreakPolicy | null>(null);
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0); // seconds since clock-in
  const [breakElapsed, setBreakElapsed] = useState(0); // seconds in current break
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch today's session
  const fetchSession = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/sessions');
      const json = await res.json();
      if (json.success) {
        setSession(json.data?.session || null);
        setBreakPolicy(json.data?.breakPolicy || null);
      } else {
        setError(json.error);
      }
    } catch {
      setError('Failed to load session');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch monthly analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const now = new Date();
      const res = await fetch(`/api/sessions/analytics?month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
      const json = await res.json();
      if (json.success) {
        setAnalytics(json.data);
      }
    } catch { /* silently fail */ }
  }, []);

  useEffect(() => {
    fetchSession();
    fetchAnalytics();
  }, [fetchSession, fetchAnalytics]);

  // Live timer
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (session && (session.status === 'ACTIVE' || session.status === 'ON_BREAK')) {
      const clockInTime = new Date(session.clockIn).getTime();

      // Find active break start
      const activeBreak = session.breaks.find(b => !b.endedAt);
      const breakStartTime = activeBreak ? new Date(activeBreak.startedAt).getTime() : null;

      timerRef.current = setInterval(() => {
        const now = Date.now();
        setElapsed(Math.floor((now - clockInTime) / 1000));
        if (breakStartTime && session.status === 'ON_BREAK') {
          setBreakElapsed(Math.floor((now - breakStartTime) / 1000));
        } else {
          setBreakElapsed(0);
        }
      }, 1000);

      // Set initial values
      const now = Date.now();
      setElapsed(Math.floor((now - clockInTime) / 1000));
      if (breakStartTime && session.status === 'ON_BREAK') {
        setBreakElapsed(Math.floor((now - breakStartTime) / 1000));
      }
    } else {
      setElapsed(0);
      setBreakElapsed(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session]);

  // Actions
  const clockIn = async () => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (json.success) {
        await fetchSession();
        await fetchAnalytics();
      }
      return json;
    } catch {
      return { success: false, error: 'Failed to clock in' };
    }
  };

  const clockOut = async () => {
    try {
      const res = await fetch('/api/sessions/clock-out', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        await fetchSession();
        await fetchAnalytics();
      }
      return json;
    } catch {
      return { success: false, error: 'Failed to clock out' };
    }
  };

  const startBreak = async (type: string, slotName?: string) => {
    try {
      const res = await fetch('/api/sessions/break', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, slotName }),
      });
      const json = await res.json();
      if (json.success) await fetchSession();
      return json;
    } catch {
      return { success: false, error: 'Failed to start break' };
    }
  };

  const resumeWork = async () => {
    try {
      const res = await fetch('/api/sessions/resume', { method: 'POST' });
      const json = await res.json();
      if (json.success) await fetchSession();
      return json;
    } catch {
      return { success: false, error: 'Failed to resume work' };
    }
  };

  return {
    session,
    breakPolicy,
    analytics,
    isLoading,
    error,
    elapsed,
    breakElapsed,
    clockIn,
    clockOut,
    startBreak,
    resumeWork,
    refetch: fetchSession,
  };
}
