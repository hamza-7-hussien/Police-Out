import { Difficulty, LevelDef } from './types';
import { parseLevelCode } from './solver';
import { BEGINNER_1_LEVELS, rotCCW } from './levels_beginner_1';
import { BEGINNER_2_LEVELS } from './levels_beginner_2';
import { INTERMEDIATE_1_LEVELS } from './levels_intermediate_1';
import { INTERMEDIATE_2_LEVELS } from './levels_intermediate_2';
import { ADVANCED_1_LEVELS } from './levels_advanced_1';
import { ADVANCED_2_LEVELS } from './levels_advanced_2';
import { ADVANCED_3_LEVELS } from './levels_advanced_3';

/**
 * Interactive Preface Tutorial ("Example: Mobile 3" from booklet preface / page 23):
 * Step 1: Slide Red Car (Rv21) UP to row 0
 * Step 2: Slide Yellow Taxi (Th32) LEFT to col 0
 * Step 3: Slide Police Car (Pv03) DOWN to row 4 to escape!
 */
export const TUTORIAL_LEVEL: LevelDef = {
  id: 0,
  difficulty: 'beginner',
  parMoves: 3,
  vehicles: parseLevelCode(rotCCW('Ov04,Rh12,Tv22,Bh24,Ph34,Av42')),
};

export const ALL_LEVELS: LevelDef[] = [
  ...BEGINNER_1_LEVELS,
  ...BEGINNER_2_LEVELS,
  ...INTERMEDIATE_1_LEVELS,
  ...INTERMEDIATE_2_LEVELS,
  ...ADVANCED_1_LEVELS,
  ...ADVANCED_2_LEVELS,
  ...ADVANCED_3_LEVELS,
];

export const DIFFICULTY_RANGES: Record<Difficulty, { start: number; end: number }> = {
  beginner: { start: 1, end: 80 },
  intermediate: { start: 81, end: 208 },
  advanced: { start: 209, end: 360 },
};

export function getLevelById(id: number): LevelDef {
  return ALL_LEVELS.find((l) => l.id === id) ?? ALL_LEVELS[0];
}
