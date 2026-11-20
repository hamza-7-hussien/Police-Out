export type Orientation = 'h' | 'v';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Vehicle visual types matching the physical Puzzle Parking Lot set:
 * Length 2:
 *  P = Police Car (Black & White target car, always vertical in col 3)
 *  T = Yellow Taxi
 *  A = White Ambulance
 *  B = Blue Car
 *  R = Red / Crimson Sports Car
 *  K = Black Armored / Van
 *  G = Green Post Mail Van
 *  C = Teal / Mint Eco Car
 *  O = Amber / Gold Pickup
 * Length 3:
 *  F = Red Fire Truck
 *  Y = Yellow School Bus
 *  L = Light Blue Tanker / Bus
 *  N = Green Container Truck
 */
export type VehicleKind =
  | 'P'
  | 'T'
  | 'A'
  | 'B'
  | 'R'
  | 'K'
  | 'G'
  | 'C'
  | 'O'
  | 'F'
  | 'Y'
  | 'L'
  | 'N';

export interface Vehicle {
  id: string;
  kind: VehicleKind;
  dir: Orientation;
  row: number; // 0..5 (top to bottom)
  col: number; // 0..5 (left to right)
  len: 2 | 3;
}

export interface LevelDef {
  id: number; // 1..360
  difficulty: Difficulty;
  parMoves: number; // "Mobile N" from the booklet
  vehicles: Vehicle[];
}

export interface MoveStep {
  vehicleId: string;
  kind: VehicleKind;
  dir: Orientation;
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  delta: number; // signed change along its axis (row for 'v', col for 'h')
}

export interface LevelProgress {
  solved: boolean;
  bestMoves: number;
  stars: 0 | 1 | 2 | 3;
}

export type Language = 'ar' | 'en';

export type BoardTheme =
  | 'classic'
  | 'night'
  | 'rain'
  | 'desert'
  | 'snow'
  | 'sunset'
  | 'cyber'
  | 'autumn';

export type GameMode = 'classic' | 'timed' | 'limited' | 'daily';

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  solvedCount: number;
  totalStars: number;
  achievementsCount: number;
  dailyStreak: number;
}

export interface DailyScoreEntry {
  userId: string;
  dateKey: string;
  levelId: number;
  displayName: string;
  photoURL: string;
  moves: number;
  timeSeconds: number;
  stars: number;
}

export const VEHICLE_LENGTH: Record<VehicleKind, 2 | 3> = {
  P: 2,
  T: 2,
  A: 2,
  B: 2,
  R: 2,
  K: 2,
  G: 2,
  C: 2,
  O: 2,
  F: 3,
  Y: 3,
  L: 3,
  N: 3,
};

export const GRID_SIZE = 6;
export const EXIT_COL = 3;
export const EXIT_ROW = 4; // Police car (len 2, vertical in col 3) reaches row 4..5 to exit!
