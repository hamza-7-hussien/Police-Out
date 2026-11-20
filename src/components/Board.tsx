import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronDown } from 'lucide-react';
import { BoardTheme, EXIT_COL, EXIT_ROW, GRID_SIZE, MoveStep, Vehicle } from '../game/types';
import { getSlideBounds, isGoalClear } from '../game/solver';
import { sound } from '../game/sound';
import { VehicleArt } from './VehicleArt';

interface BoardProps {
  vehicles: Vehicle[];
  onCommitMove: (vehicleId: string, toRow: number, toCol: number) => void;
  hintStep: MoveStep | null;
  locked?: boolean;
  tutorialStep?: MoveStep | null;
  isWon: boolean;
  isExiting: boolean;
  autoSlidingPolice?: boolean;
  theme?: BoardTheme;
}

interface DragState {
  vehicleId: string;
  startPointer: number;
  origCoord: number;
  currentCoord: number;
  min: number;
  max: number;
  dir: 'h' | 'v';
  lastIntCoord: number;
}

const CONFETTI_COLORS = [
  '#ef4444',
  '#3b82f6',
  '#facc15',
  '#22c55e',
  '#f8fafc',
  '#fb923c',
  '#a855f7',
];

const TreeCanopy: React.FC<{
  className?: string;
  outer?: string;
  leafA?: string;
  leafB?: string;
  leafC?: string;
  highlight?: string;
}> = ({
  className = '',
  outer = '#2e5c1e',
  leafA = '#4d8b2c',
  leafB = '#3f7a24',
  leafC = '#366c1f',
  highlight = '#70b33e',
}) => (
  <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
    <circle cx="22" cy="23" r="14" fill="rgba(0,0,0,0.35)" />
    <circle cx="20" cy="20" r="14" fill={outer} />
    <circle cx="15" cy="17" r="9" fill={leafA} />
    <circle cx="25" cy="16" r="8" fill={leafB} />
    <circle cx="20" cy="24" r="8" fill={leafC} />
    <circle cx="17" cy="15" r="4.5" fill={highlight} opacity="0.88" />
  </svg>
);

const DesertCactus: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
    <ellipse cx="22" cy="23" rx="13" ry="11" fill="rgba(0,0,0,0.28)" />
    <circle cx="20" cy="20" r="11" fill="#3f6212" />
    <circle cx="17" cy="18" r="7" fill="#65a30d" />
    <circle cx="23" cy="22" r="5" fill="#4d7c0f" />
    <circle cx="18" cy="16" r="2.2" fill="#facc15" opacity="0.9" />
  </svg>
);

export const Board: React.FC<BoardProps> = ({
  vehicles,
  onCommitMove,
  hintStep,
  locked = false,
  tutorialStep = null,
  isWon,
  isExiting,
  autoSlidingPolice = false,
  theme = 'classic',
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridSizePx, setGridSizePx] = useState(324);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [bumped, setBumped] = useState<{ id: string; dir: 'h' | 'v' } | null>(null);
  const [snappedId, setSnappedId] = useState<string | null>(null);

  const pathClear = useMemo(() => isGoalClear(vehicles), [vehicles]);
  const prevPathClearRef = useRef(pathClear);

  useEffect(() => {
    if (pathClear && !prevPathClearRef.current && !isWon && !locked) {
      sound.playGateUnlock();
    }
    prevPathClearRef.current = pathClear;
  }, [pathClear, isWon, locked]);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setGridSizePx(w);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cellSize = gridSizePx / GRID_SIZE;

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 32 }, (_, idx) => {
        const angle = (idx / 32) * Math.PI * 2;
        const dist = 58 + (idx % 5) * 30;
        return {
          id: idx,
          tx: `${Math.round(Math.cos(angle) * dist)}px`,
          ty: `${Math.round(Math.sin(angle) * dist - 42)}px`,
          rot: `${(idx % 2 === 0 ? 1 : -1) * (180 + idx * 20)}deg`,
          color: CONFETTI_COLORS[idx % CONFETTI_COLORS.length],
          isCircle: idx % 4 === 0,
        };
      }),
    []
  );

  const activeHighlight = tutorialStep ?? hintStep;

  const triggerBump = (id: string, dir: 'h' | 'v') => {
    sound.playBump();
    setBumped({ id, dir });
    window.setTimeout(() => {
      setBumped((cur) => (cur?.id === id ? null : cur));
    }, 280);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, v: Vehicle) => {
    if (locked || isWon) return;
    if (tutorialStep && v.id !== tutorialStep.vehicleId) {
      triggerBump(v.id, v.dir);
      return;
    }

    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    const bounds = getSlideBounds(vehicles, v.id);
    if (bounds.min === bounds.max) {
      triggerBump(v.id, v.dir);
      return;
    }

    const origCoord = v.dir === 'h' ? v.col : v.row;
    const startPointer = v.dir === 'h' ? e.clientX : e.clientY;

    setDrag({
      vehicleId: v.id,
      startPointer,
      origCoord,
      currentCoord: origCoord,
      min: bounds.min,
      max: bounds.max,
      dir: v.dir,
      lastIntCoord: origCoord,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    const pointer = drag.dir === 'h' ? e.clientX : e.clientY;
    const deltaCells = (pointer - drag.startPointer) / cellSize;
    const clamped = Math.max(drag.min, Math.min(drag.max, drag.origCoord + deltaCells));
    const rounded = Math.round(clamped);

    if (rounded !== drag.lastIntCoord) {
      sound.playTick();
    }

    setDrag((prev) =>
      prev
        ? {
            ...prev,
            currentCoord: clamped,
            lastIntCoord: rounded,
          }
        : null
    );
  };

  const finishDrag = () => {
    if (!drag) return;
    const v = vehicles.find((item) => item.id === drag.vehicleId);
    let snapped = Math.round(drag.currentCoord);
    snapped = Math.max(drag.min, Math.min(drag.max, snapped));

    setDrag(null);

    if (!v) return;
    const orig = drag.origCoord;
    if (snapped !== orig) {
      const toRow = v.dir === 'v' ? snapped : v.row;
      const toCol = v.dir === 'h' ? snapped : v.col;
      sound.playSnap(Math.abs(snapped - orig));
      setSnappedId(v.id);
      window.setTimeout(() => {
        setSnappedId((cur) => (cur === v.id ? null : cur));
      }, 220);
      onCommitMove(v.id, toRow, toCol);
    }
  };

  const renderDirectionIcon = (step: MoveStep) => {
    const cls = 'w-5 h-5 text-amber-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]';
    if (step.dir === 'h') {
      return step.delta > 0 ? <ArrowRight className={cls} /> : <ArrowLeft className={cls} />;
    }
    return step.delta > 0 ? <ArrowDown className={cls} /> : <ArrowUp className={cls} />;
  };

  const draggedVehicle = drag ? vehicles.find((v) => v.id === drag.vehicleId) : null;

  const parkwayClass: Record<BoardTheme, string> = {
    classic: 'parkway-grass',
    night: 'parkway-night',
    rain: 'parkway-rain',
    desert: 'parkway-desert',
    snow: 'parkway-snow',
    sunset: 'parkway-sunset',
    cyber: 'parkway-cyber',
    autumn: 'parkway-autumn',
  };

  const asphaltClass: Record<BoardTheme, string> = {
    classic: 'asphalt-surface',
    night: 'asphalt-night',
    rain: 'asphalt-rain',
    desert: 'asphalt-desert',
    snow: 'asphalt-snow',
    sunset: 'asphalt-sunset',
    cyber: 'asphalt-cyber',
    autumn: 'asphalt-autumn',
  };

  const treePalette =
    theme === 'snow'
      ? {
          outer: '#334155',
          leafA: '#cbd5e1',
          leafB: '#94a3b8',
          leafC: '#64748b',
          highlight: '#f8fafc',
        }
      : theme === 'autumn'
        ? {
            outer: '#7c2d12',
            leafA: '#ea580c',
            leafB: '#dc2626',
            leafC: '#d97706',
            highlight: '#fbbf24',
          }
        : theme === 'sunset'
          ? {
              outer: '#3b1c32',
              leafA: '#7c2d12',
              leafB: '#6d28d9',
              leafC: '#4c1d95',
              highlight: '#fb923c',
            }
          : {
              outer: '#2e5c1e',
              leafA: '#4d8b2c',
              leafB: '#3f7a24',
              leafC: '#366c1f',
              highlight: '#70b33e',
            };

  const bollardClass =
    theme === 'night'
      ? 'bg-amber-300 shadow-[0_0_12px_3px_rgba(251,191,36,0.88)]'
      : theme === 'rain'
        ? 'bg-sky-300 shadow-[0_0_11px_2px_rgba(56,189,248,0.82)]'
        : theme === 'snow'
          ? 'bg-sky-100 shadow-[0_0_10px_2px_rgba(186,230,253,0.75)]'
          : theme === 'cyber'
            ? 'bg-cyan-300 shadow-[0_0_13px_3px_rgba(34,211,238,0.92)]'
            : theme === 'sunset'
              ? 'bg-orange-300 shadow-[0_0_10px_2px_rgba(251,146,60,0.8)]'
              : 'bg-amber-400/90';

  return (
    <div dir="ltr" className="relative w-full max-w-[446px] mx-auto select-none">
      {/* Outer Brushed Architectural Chassis Frame */}
      <div
        className={`relative rounded-[32px] p-[5px] shadow-[0_28px_65px_rgba(0,0,0,0.78),0_0_0_1px_rgba(255,255,255,0.08)] ${
          theme === 'cyber'
            ? 'bg-gradient-to-b from-cyan-500/45 via-slate-800 to-fuchsia-600/40'
            : 'bg-gradient-to-b from-slate-600/80 via-slate-800 to-slate-950'
        }`}
      >
        {/* Urban Miniature Parkway Surrounding the Track */}
        <div
          className={`relative rounded-[27px] px-3 pt-3 pb-7 sm:px-4 sm:pt-4 sm:pb-8 ${parkwayClass[theme]} shadow-[inset_0_2px_6px_rgba(255,255,255,0.22),inset_0_-10px_20px_rgba(0,0,0,0.45)] overflow-hidden transition-colors duration-300`}
        >
          {/* Corner Parkway Flora / Outpost Accents */}
          {theme === 'desert' ? (
            <>
              <DesertCactus className="pointer-events-none absolute -top-1.5 -left-1.5 w-9 h-9 opacity-90" />
              <DesertCactus className="pointer-events-none absolute -top-1.5 -right-1.5 w-9 h-9 opacity-90" />
              <DesertCactus className="pointer-events-none absolute bottom-1.5 -left-1.5 w-8 h-8 opacity-85" />
              <DesertCactus className="pointer-events-none absolute bottom-1.5 -right-1.5 w-8 h-8 opacity-85" />
            </>
          ) : theme !== 'cyber' ? (
            <>
              <TreeCanopy
                {...treePalette}
                className={`pointer-events-none absolute -top-1.5 -left-1.5 w-10 h-10 ${theme === 'night' || theme === 'rain' ? 'opacity-55 brightness-60' : 'opacity-95'}`}
              />
              <TreeCanopy
                {...treePalette}
                className={`pointer-events-none absolute -top-1.5 -right-1.5 w-10 h-10 ${theme === 'night' || theme === 'rain' ? 'opacity-55 brightness-60' : 'opacity-95'}`}
              />
              <TreeCanopy
                {...treePalette}
                className={`pointer-events-none absolute bottom-1.5 -left-1.5 w-9 h-9 ${theme === 'night' || theme === 'rain' ? 'opacity-50 brightness-60' : 'opacity-90'}`}
              />
              <TreeCanopy
                {...treePalette}
                className={`pointer-events-none absolute bottom-1.5 -right-1.5 w-9 h-9 ${theme === 'night' || theme === 'rain' ? 'opacity-50 brightness-60' : 'opacity-90'}`}
              />
            </>
          ) : null}

          {/* Subtle Parkway Sidewalk Paving Frame */}
          <div className="relative rounded-[20px] p-2 bg-gradient-to-b from-slate-300/25 via-slate-400/15 to-slate-900/35 border border-white/15 shadow-[inset_0_3px_10px_rgba(0,0,0,0.6),0_6px_16px_rgba(0,0,0,0.4)]">
            {/* Concrete Curb Corner Bollards */}
            <div className={`pointer-events-none absolute top-1 left-1 w-2 h-2 rounded-full border border-slate-900 shadow ${bollardClass}`} />
            <div className={`pointer-events-none absolute top-1 right-1 w-2 h-2 rounded-full border border-slate-900 shadow ${bollardClass}`} />
            <div className={`pointer-events-none absolute bottom-1 left-1 w-2 h-2 rounded-full border border-slate-900 shadow ${bollardClass}`} />
            <div className={`pointer-events-none absolute bottom-1 right-1 w-2 h-2 rounded-full border border-slate-900 shadow ${bollardClass}`} />

            {/* 6x6 Textured Asphalt Parking Surface */}
            <div
              ref={gridRef}
              className={`relative w-full aspect-square rounded-[13px] ${asphaltClass[theme]} shadow-[inset_0_5px_18px_rgba(0,0,0,0.85)] border border-slate-950/90 overflow-visible`}
              style={{ touchAction: 'none' }}
            >
              {/* Painted Bay Markings & Full 6-Row Exit Runway */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 pointer-events-none rounded-[13px] overflow-hidden">
                {Array.from({ length: 36 }).map((_, idx) => {
                  const r = Math.floor(idx / 6);
                  const c = idx % 6;
                  const isExitCol = c === EXIT_COL;
                  const laneGreen = isExitCol && (pathClear || isWon);
                  return (
                    <div
                      key={idx}
                      className={`relative border transition-colors duration-300 ${
                        laneGreen
                          ? 'border-emerald-400/25 bg-emerald-400/20 runway-flow'
                          : isExitCol
                            ? 'border-white/[0.06] bg-amber-400/[0.04]'
                            : 'border-white/[0.055]'
                      }`}
                    >
                      {/* Tactile grid intersection peg */}
                      <span className="absolute -top-[2px] -left-[2px] w-1 h-1 rounded-full bg-white/15" />

                      {/* Exit Lane Guidance Chevrons across full corridor */}
                      {isExitCol && r >= 1 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ChevronDown
                            className={`w-4 h-4 transition-colors duration-300 ${
                              pathClear || isWon
                                ? 'text-emerald-300 animate-exit-chevron drop-shadow-[0_0_6px_rgba(52,211,153,0.75)]'
                                : 'text-amber-300/35'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Side painted lane stripes framing full Column 3 */}
                <div
                  className={`absolute top-0 bottom-0 border-x-2 border-dashed transition-all duration-300 ${
                    pathClear || isWon
                      ? 'border-emerald-400/80 shadow-[0_0_16px_rgba(52,211,153,0.45)]'
                      : 'border-amber-400/25'
                  }`}
                  style={{
                    left: EXIT_COL * cellSize,
                    width: cellSize,
                  }}
                />
              </div>

              {/* Active Drag Target Slot Glow (only on movable cars, only under landing squares) */}
              {drag && draggedVehicle && (() => {
                const targetCoord = Math.max(
                  drag.min,
                  Math.min(drag.max, Math.round(drag.currentCoord))
                );
                const movedToNew = targetCoord !== drag.origCoord;
                return Array.from({ length: draggedVehicle.len }).map((_, idx) => {
                  const r = drag.dir === 'v' ? targetCoord + idx : draggedVehicle.row;
                  const c = drag.dir === 'h' ? targetCoord + idx : draggedVehicle.col;
                  return (
                    <div
                      key={idx}
                      className={`pointer-events-none absolute rounded-xl transition-all duration-75 z-[6] ${
                        movedToNew
                          ? 'bg-sky-400/28 border-2 border-sky-300/80 shadow-[inset_0_0_16px_rgba(56,189,248,0.45),0_0_14px_rgba(56,189,248,0.35)]'
                          : 'bg-white/[0.08] border border-white/25'
                      }`}
                      style={{
                        left: c * cellSize + 3,
                        top: r * cellSize + 3,
                        width: cellSize - 6,
                        height: cellSize - 6,
                      }}
                    />
                  );
                });
              })()}

              {/* Active Hint / Tutorial Destination Marker (non-overlapping free squares) */}
              {activeHighlight && !isWon && (() => {
                const hlVehicle = vehicles.find((v) => v.id === activeHighlight.vehicleId);
                const len = hlVehicle?.len ?? 2;
                const absDelta = Math.abs(activeHighlight.delta);
                const curRow = hlVehicle ? hlVehicle.row : activeHighlight.fromRow;
                const curCol = hlVehicle ? hlVehicle.col : activeHighlight.fromCol;

                let freeRow = activeHighlight.toRow;
                let freeCol = activeHighlight.toCol;
                let freeRows = activeHighlight.dir === 'v' ? len : 1;
                let freeCols = activeHighlight.dir === 'h' ? len : 1;

                if (absDelta > 0 && absDelta < len) {
                  if (activeHighlight.dir === 'h') {
                    freeCols = absDelta;
                    freeCol =
                      activeHighlight.delta > 0 ? curCol + len : activeHighlight.toCol;
                  } else {
                    freeRows = absDelta;
                    freeRow =
                      activeHighlight.delta > 0 ? curRow + len : activeHighlight.toRow;
                  }
                }

                return (
                  <div
                    className="absolute pointer-events-none rounded-xl border-2 border-amber-400 bg-amber-400/20 animate-slot-pulse transition-all duration-200 z-[25] flex items-center justify-center"
                    style={{
                      left: freeCol * cellSize + 4,
                      top: freeRow * cellSize + 4,
                      width: freeCols * cellSize - 8,
                      height: freeRows * cellSize - 8,
                    }}
                  >
                    <div
                      className={activeHighlight.dir === 'h' ? 'animate-hint-h' : 'animate-hint-v'}
                      style={
                        {
                          '--nudge-x': `${activeHighlight.delta > 0 ? 6 : -6}px`,
                          '--nudge-y': `${activeHighlight.delta > 0 ? 6 : -6}px`,
                        } as React.CSSProperties
                      }
                    >
                      {renderDirectionIcon(activeHighlight)}
                    </div>
                  </div>
                );
              })()}

              {/* Vehicles Layer */}
              {vehicles.map((v) => {
                const isDraggingThis = drag?.vehicleId === v.id;
                const isPoliceExit = v.kind === 'P' && isExiting;
                const isBumped = bumped?.id === v.id;
                const isSnapped = snappedId === v.id;

                const rowPos = isPoliceExit
                  ? EXIT_ROW + 1.85
                  : isDraggingThis && drag.dir === 'v'
                    ? drag.currentCoord
                    : v.row;

                const colPos =
                  isDraggingThis && drag.dir === 'h' ? drag.currentCoord : v.col;

                const isHighlighted = activeHighlight?.vehicleId === v.id;
                const isDimmed = Boolean(tutorialStep && tutorialStep.vehicleId !== v.id);
                const isPoliceAutoSlide = v.kind === 'P' && autoSlidingPolice && !isPoliceExit;

                const width = (v.dir === 'h' ? v.len : 1) * cellSize;
                const height = (v.dir === 'v' ? v.len : 1) * cellSize;

                return (
                  <div
                    key={v.id}
                    onPointerDown={(e) => handlePointerDown(e, v)}
                    onPointerMove={isDraggingThis ? handlePointerMove : undefined}
                    onPointerUp={isDraggingThis ? finishDrag : undefined}
                    onPointerCancel={isDraggingThis ? finishDrag : undefined}
                    role="button"
                    aria-label={`${v.kind} ${v.dir === 'h' ? 'horizontal' : 'vertical'}`}
                    className={`absolute top-0 left-0 p-[3px] ${
                      isDraggingThis
                        ? 'z-30 cursor-grabbing'
                        : isPoliceExit
                          ? 'z-40 transition-transform duration-[560ms] ease-in'
                          : isPoliceAutoSlide
                            ? 'z-40 transition-transform duration-[420ms] ease-in-out'
                            : 'z-20 cursor-grab transition-[transform,opacity] duration-150 ease-out'
                    } ${
                      isDimmed ? 'opacity-40 grayscale-[35%]' : 'opacity-100'
                    }`}
                    style={{
                      width,
                      height,
                      touchAction: 'none',
                      transform: `translate3d(${colPos * cellSize}px, ${rowPos * cellSize}px, 0)`,
                    }}
                  >
                    <div
                      className={`w-full h-full rounded-xl relative ${
                        isBumped
                          ? bumped?.dir === 'h'
                            ? 'animate-bump-h ring-2 ring-rose-500/80'
                            : 'animate-bump-v ring-2 ring-rose-500/80'
                          : ''
                      } ${isSnapped ? 'animate-snap-pop' : ''} ${
                        isHighlighted
                          ? 'ring-2 ring-amber-400 shadow-[0_0_22px_rgba(250,204,21,0.6)]'
                          : isDraggingThis
                            ? 'ring-2 ring-sky-300/85 bg-sky-400/10'
                            : ''
                      }`}
                    >
                      <VehicleArt
                        kind={v.kind}
                        dir={v.dir}
                        len={v.len}
                        flashing={v.kind === 'P' && (isWon || isHighlighted || pathClear)}
                        highlighted={isHighlighted}
                        headlightsOn={
                          theme === 'night' ||
                          theme === 'rain' ||
                          theme === 'cyber' ||
                          theme === 'sunset' ||
                          (v.kind === 'P' && (pathClear || isWon))
                        }
                      />
                    </div>
                  </div>
                );
              })}

              {/* 60fps GPU-Composited Gentle Rain & Snow Overlays */}
              {theme === 'rain' && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[13px] overflow-hidden z-[42]"
                >
                  <div className="rain-layer-gpu" />
                </div>
              )}

              {theme === 'snow' && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[13px] overflow-hidden z-[42]"
                >
                  <div className="snow-layer-gpu" />
                </div>
              )}

              {/* Pixel-Exact Exit Gate & Asphalt Road Apron Aligned to Column 3 */}
              <div
                className="pointer-events-none absolute left-0 right-0 flex items-center"
                style={{
                  top: '100%',
                  height: 30,
                }}
              >
                {/* Left Hazard Curb Bar */}
                <div
                  className="h-2.5 rounded-full hazard-stripes opacity-90 shadow"
                  style={{ width: Math.max(0, EXIT_COL * cellSize - 8) }}
                />

                {/* Gate Corridor Aligned with Col 3 */}
                <div
                  className="relative h-full flex items-center justify-center"
                  style={{ width: cellSize + 16 }}
                >
                  {/* Continuing Asphalt Exit Roadway Apron */}
                  <div
                    className={`absolute top-0 bottom-[-14px] border-x shadow-inner transition-colors duration-300 ${
                      isWon || pathClear
                        ? 'bg-emerald-950/85 border-emerald-400/50'
                        : 'asphalt-surface border-white/15'
                    }`}
                    style={{ width: cellSize - 4 }}
                  />

                  {/* Left Gate Control Post + Live Traffic Beacon */}
                  <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-3.5 h-5 rounded bg-slate-200 border border-slate-800 shadow z-20 flex flex-col items-center justify-center">
                    <span
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        isWon || pathClear
                          ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                          : 'bg-rose-500 shadow-[0_0_6px_#ef4444]'
                      }`}
                    />
                  </div>

                  {/* Raising Mechanical Boom Arm */}
                  <div
                    className="h-2.5 rounded-full boom-stripes origin-left transition-transform duration-300 ease-out shadow-md z-10"
                    style={{
                      width: cellSize,
                      transform: isWon || pathClear ? 'rotate(-78deg)' : 'rotate(0deg)',
                    }}
                  />

                  {/* Right Gate Receiver */}
                  <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-2.5 h-4 rounded-sm bg-slate-400 border border-slate-800 shadow z-10" />
                </div>

                {/* Right Hazard Curb Bar */}
                <div
                  className="flex-1 h-2.5 rounded-full hazard-stripes opacity-90 shadow"
                />
              </div>

              {/* Victory Shockwave Ring & Confetti Burst at Exit Gate */}
              {isWon && (
                <div
                  className="pointer-events-none absolute z-50"
                  style={{
                    left: (EXIT_COL + 0.5) * cellSize,
                    top: 5.75 * cellSize,
                  }}
                >
                  <span className="absolute w-14 h-14 rounded-full border-2 border-emerald-400 animate-shockwave" />
                  <span className="absolute w-10 h-10 rounded-full border-2 border-amber-300 animate-shockwave" />
                  {confettiPieces.map((c) => (
                    <span
                      key={c.id}
                      className={`absolute w-2.5 h-2.5 animate-confetti ${
                        c.isCircle ? 'rounded-full' : 'rounded-[2px]'
                      }`}
                      style={
                        {
                          backgroundColor: c.color,
                          '--tx': c.tx,
                          '--ty': c.ty,
                          '--rot': c.rot,
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
