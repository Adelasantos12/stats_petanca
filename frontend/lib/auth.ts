'use client';

export interface Coach {
  id: string;
  name: string;
  email: string;
  role: 'COACH' | 'SUPER_ADMIN';
}

const TOKEN_KEY = 'ciep_token';
const COACH_KEY = 'ciep_coach';
const PLAYER_KEY = 'ciep_player';

export interface Player {
  id: string;
  name: string;
  email: string | null;
  level: string | null;
  category: string | null;
}

export function setSession(token: string, coach: Coach) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(COACH_KEY, JSON.stringify(coach));
  localStorage.removeItem(PLAYER_KEY);
}

export function setPlayerSession(token: string, player: Player) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(PLAYER_KEY, JSON.stringify(player));
  localStorage.removeItem(COACH_KEY);
}

export function getPlayer(): Player | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(PLAYER_KEY);
  return raw ? (JSON.parse(raw) as Player) : null;
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
  localStorage.removeItem(PLAYER_KEY);
}
