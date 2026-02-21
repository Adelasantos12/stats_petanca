export type Modality = 'SINGLE' | 'DOUBLES' | 'TRIPLES';

export interface Player {
  id: string;
  name: string;
}

export interface MatchPlayer {
  matchId: string;
  playerId: string;
  teamSide: 'A' | 'B';
  player: Player;
}

export interface Throw {
  id: string;
  matchId: string;
  handNumber: number;
  teamSide: 'A' | 'B';
  playerId: string;
  throwType: 'POINT' | 'TIR';
  effectivenessScore: number;
  distanceD?: number;
  note?: string;
  createdAt: string;
  player?: Player;
}

export interface Hand {
  id: string;
  matchId: string;
  handNumber: number;
  status: 'NORMAL' | 'CANCELED';
  pointsTeam?: 'A' | 'B';
  pointsValue?: number;
}

export interface Match {
  id: string;
  modality: Modality;
  targetPoints: number;
  status: 'IN_PROGRESS' | 'FINISHED';
  endReason?: string;
  teamAName: string;
  teamBName: string;
  createdAt: string;
  endedAt?: string;
  players: MatchPlayer[];
  hands: Hand[];
  throws: Throw[];
}

export interface PerformanceMetrics {
  n: number;
  suma: number;
  media: number | null;
  performance: number | null;
}

export interface PlayerPerformance {
  playerId: string;
  playerName: string;
  teamSide: 'A' | 'B';
  total: PerformanceMetrics;
  point: PerformanceMetrics;
  tir: PerformanceMetrics;
}

export interface PerformanceResponse {
  players: PlayerPerformance[];
  teams: {
    A: PerformanceMetrics;
    B: PerformanceMetrics;
  };
}
