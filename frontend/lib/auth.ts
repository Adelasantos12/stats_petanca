'use client';

export interface Coach {
  id: string;
  name: string;
  email: string;
  role: 'COACH' | 'SUPER_ADMIN';
}

const TOKEN_KEY = 'ciep_token';
const COACH_KEY = 'ciep_coach';

export function setSession(token: string, coach: Coach) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(COACH_KEY, JSON.stringify(coach));
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getCoach(): Coach | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(COACH_KEY);
  return raw ? (JSON.parse(raw) as Coach) : null;
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(COACH_KEY);
}
