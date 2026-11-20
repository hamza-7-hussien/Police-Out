import { EXIT_COL, EXIT_ROW, GRID_SIZE, MoveStep, Vehicle, VehicleKind, VEHICLE_LENGTH, Orientation } from './types';

/**
 * Parse compact level string like "Pv03,Rh21,..." into Vehicle[].
 * Format per token: <Kind><Dir 'h'|'v'><Row 0-5><Col 0-5>
 */
export function parseLevelCode(code: string): Vehicle[] {
  const tokens = code
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return tokens.map((tok, idx) => {
    const kind = tok[0] as VehicleKind;
    const dir = tok[1] as Orientation;
    const row = Number(tok[2]);
    const col = Number(tok[3]);
    const len = VEHICLE_LENGTH[kind];
    if (!len || (dir !== 'h' && dir !== 'v') || Number.isNaN(row) || Number.isNaN(col)) {
      throw new Error(`Invalid vehicle token "${tok}"`);
    }
    return {
      id: kind === 'P' ? 'police' : `v${idx}`,
      kind,
      dir,
      row,
      col,
      len,
    };
  });
}

export function validateBoard(vehicles: Vehicle[]): string | null {
  const grid = Array.from({ length: GRID_SIZE }, () => Array<string | null>(GRID_SIZE).fill(null));
  let policeCount = 0;

  for (const v of vehicles) {
    if (v.kind === 'P') {
      policeCount++;
      if (v.dir !== 'v' || v.col !== EXIT_COL || v.len !== 2) {
        return `Police car must be vertical length 2 in col ${EXIT_COL}, got dir=${v.dir} col=${v.col} len=${v.len}`;
      }
    }
    for (let i = 0; i < v.len; i++) {
      const r = v.dir === 'v' ? v.row + i : v.row;
      const c = v.dir === 'h' ? v.col + i : v.col;
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {
        return `Vehicle ${v.id} (${v.kind}) out of bounds at (${r},${c})`;
      }
      if (grid[r][c] !== null) {
        return `Overlap at (${r},${c}) between ${grid[r][c]} and ${v.id} (${v.kind})`;
      }
      grid[r][c] = v.id;
    }
  }

  if (policeCount !== 1) {
    return `Expected exactly 1 police car, found ${policeCount}`;
  }
  return null;
}

/**
 * Computes the minimum and maximum valid coordinate along the vehicle's axis
 * (row for 'v', col for 'h').
 */
export function getSlideBounds(vehicles: Vehicle[], targetId: string): { min: number; max: number } {
  const grid = new Uint8Array(GRID_SIZE * GRID_SIZE);
  let target: Vehicle | undefined;

  for (const v of vehicles) {
    if (v.id === targetId) {
      target = v;
      continue;
    }
    for (let i = 0; i < v.len; i++) {
      const r = v.dir === 'v' ? v.row + i : v.row;
      const c = v.dir === 'h' ? v.col + i : v.col;
      grid[r * GRID_SIZE + c] = 1;
    }
  }

  if (!target) return { min: 0, max: 0 };

  if (target.dir === 'h') {
    let min = target.col;
    while (min > 0 && grid[target.row * GRID_SIZE + (min - 1)] === 0) {
      min--;
    }
    let max = target.col;
    while (max + target.len < GRID_SIZE && grid[target.row * GRID_SIZE + (max + target.len)] === 0) {
      max++;
    }
    return { min, max };
  } else {
    let min = target.row;
    while (min > 0 && grid[(min - 1) * GRID_SIZE + target.col] === 0) {
      min--;
    }
    let max = target.row;
    while (max + target.len < GRID_SIZE && grid[(max + target.len) * GRID_SIZE + target.col] === 0) {
      max++;
    }
    return { min, max };
  }
}

export function isGoalClear(vehicles: Vehicle[]): boolean {
  const police = vehicles.find((v) => v.kind === 'P');
  if (!police) return false;
  if (police.row === EXIT_ROW) return true;
  // Also check if path from police.row + 2 down to row 5 in col 3 is completely clear
  for (const v of vehicles) {
    if (v.id === police.id) continue;
    for (let i = 0; i < v.len; i++) {
      const r = v.dir === 'v' ? v.row + i : v.row;
      const c = v.dir === 'h' ? v.col + i : v.col;
      if (c === EXIT_COL && r >= police.row + police.len) {
        return false;
      }
    }
  }
  return true;
}

const SOLVE_CACHE = new Map<string, MoveStep[] | null>();
const MAX_SOLVE_CACHE_ENTRIES = 512;

function serializeBoardKey(vehicles: Vehicle[], maxStates: number): string {
  return (
    vehicles
      .map((v) => `${v.id}:${v.kind}${v.dir}${v.row}${v.col}${v.len}`)
      .join('|') + `@${maxStates}`
  );
}

/**
 * Exact BFS solver for any 6x6 board state (with bounded memoization cache).
 * Note on move counting (matching the booklet's "Mobile N"):
 * - Each continuous slide of a vehicle to a new position counts as 1 move.
 * - Moving the Police Car to row 4 (the exit gate) is the final winning move!
 *   (If the police car is already at row 4, 0 moves remain.)
 */
export function solvePuzzle(vehicles: Vehicle[], maxStates = 120000): MoveStep[] | null {
  const cacheKey = serializeBoardKey(vehicles, maxStates);
  if (SOLVE_CACHE.has(cacheKey)) {
    const cached = SOLVE_CACHE.get(cacheKey);
    return cached ? cached.map((step) => ({ ...step })) : null;
  }

  const storeCached = (result: MoveStep[] | null): MoveStep[] | null => {
    if (SOLVE_CACHE.size >= MAX_SOLVE_CACHE_ENTRIES) {
      const oldestKey = SOLVE_CACHE.keys().next().value;
      if (oldestKey !== undefined) {
        SOLVE_CACHE.delete(oldestKey);
      }
    }
    SOLVE_CACHE.set(cacheKey, result ? result.map((s) => ({ ...s })) : null);
    return result;
  };

  const n = vehicles.length;
  const policeIdx = vehicles.findIndex((v) => v.kind === 'P');
  if (policeIdx === -1) return storeCached(null);

  const initialPos = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    initialPos[i] = vehicles[i].dir === 'h' ? vehicles[i].col : vehicles[i].row;
  }

  if (initialPos[policeIdx] === EXIT_ROW) {
    return storeCached([]);
  }

  // Pack positions (each 0..4 fits in 3 bits, or simply string key for up to ~16 cars)
  const encode = (pos: Uint8Array): string => {
    let s = '';
    for (let i = 0; i < n; i++) s += String.fromCharCode(48 + pos[i]);
    return s;
  };

  interface Node {
    pos: Uint8Array;
    parent: number;
    moveVehicleIdx: number;
    fromPos: number;
    toPos: number;
  }

  const queue: Node[] = [
    {
      pos: initialPos,
      parent: -1,
      moveVehicleIdx: -1,
      fromPos: 0,
      toPos: 0,
    },
  ];
  const visited = new Set<string>();
  visited.add(encode(initialPos));

  const grid = new Uint8Array(36);
  let head = 0;

  while (head < queue.length && visited.size < maxStates) {
    const cur = queue[head];
    const pos = cur.pos;

    // Build occupancy grid
    grid.fill(0);
    for (let i = 0; i < n; i++) {
      const v = vehicles[i];
      const p = pos[i];
      if (v.dir === 'h') {
        const base = v.row * 6 + p;
        for (let k = 0; k < v.len; k++) grid[base + k] = 1;
      } else {
        const base = p * 6 + v.col;
        for (let k = 0; k < v.len; k++) grid[base + k * 6] = 1;
      }
    }

    // Fast-check: can police car reach EXIT_ROW (4) in 1 move right now?
    const pPos = pos[policeIdx];
    let clearToExit = true;
    for (let r = pPos + 2; r < GRID_SIZE; r++) {
      if (grid[r * 6 + EXIT_COL] !== 0) {
        clearToExit = false;
        break;
      }
    }
    if (clearToExit) {
      // Reconstruct path + final police exit move
      const steps: MoveStep[] = [];
      const addMove = (vIdx: number, fromP: number, toP: number) => {
        const v = vehicles[vIdx];
        steps.push({
          vehicleId: v.id,
          kind: v.kind,
          dir: v.dir,
          fromRow: v.dir === 'v' ? fromP : v.row,
          fromCol: v.dir === 'h' ? fromP : v.col,
          toRow: v.dir === 'v' ? toP : v.row,
          toCol: v.dir === 'h' ? toP : v.col,
          delta: toP - fromP,
        });
      };

      const chain: Node[] = [];
      let trace = head;
      while (trace > 0) {
        chain.push(queue[trace]);
        trace = queue[trace].parent;
      }
      for (let i = chain.length - 1; i >= 0; i--) {
        addMove(chain[i].moveVehicleIdx, chain[i].fromPos, chain[i].toPos);
      }
      addMove(policeIdx, pPos, EXIT_ROW);
      return storeCached(steps);
    }

    // Generate all valid slides
    for (let i = 0; i < n; i++) {
      const v = vehicles[i];
      const p = pos[i];

      if (v.dir === 'h') {
        const rowBase = v.row * 6;
        // Slide left
        for (let np = p - 1; np >= 0; np--) {
          if (grid[rowBase + np] !== 0) break;
          const nextPos = new Uint8Array(pos);
          nextPos[i] = np;
          const key = encode(nextPos);
          if (!visited.has(key)) {
            visited.add(key);
            queue.push({ pos: nextPos, parent: head, moveVehicleIdx: i, fromPos: p, toPos: np });
          }
        }
        // Slide right
        for (let np = p + 1; np + v.len <= GRID_SIZE; np++) {
          if (grid[rowBase + np + v.len - 1] !== 0) break;
          const nextPos = new Uint8Array(pos);
          nextPos[i] = np;
          const key = encode(nextPos);
          if (!visited.has(key)) {
            visited.add(key);
            queue.push({ pos: nextPos, parent: head, moveVehicleIdx: i, fromPos: p, toPos: np });
          }
        }
      } else {
        // Slide up
        for (let np = p - 1; np >= 0; np--) {
          if (grid[np * 6 + v.col] !== 0) break;
          const nextPos = new Uint8Array(pos);
          nextPos[i] = np;
          const key = encode(nextPos);
          if (!visited.has(key)) {
            visited.add(key);
            queue.push({ pos: nextPos, parent: head, moveVehicleIdx: i, fromPos: p, toPos: np });
          }
        }
        // Slide down
        for (let np = p + 1; np + v.len <= GRID_SIZE; np++) {
          if (grid[(np + v.len - 1) * 6 + v.col] !== 0) break;
          const nextPos = new Uint8Array(pos);
          nextPos[i] = np;
          const key = encode(nextPos);
          if (!visited.has(key)) {
            visited.add(key);
            queue.push({ pos: nextPos, parent: head, moveVehicleIdx: i, fromPos: p, toPos: np });
          }
        }
      }
    }

    head++;
  }

  return storeCached(null);
}

export function applyMove(vehicles: Vehicle[], step: MoveStep): Vehicle[] {
  return vehicles.map((v) =>
    v.id === step.vehicleId ? { ...v, row: step.toRow, col: step.toCol } : v
  );
}
