import React, { useId } from 'react';
import { Orientation, VehicleKind } from '../game/types';

interface VehicleArtProps {
  kind: VehicleKind;
  dir: Orientation;
  len: 2 | 3;
  flashing?: boolean;
  highlighted?: boolean;
  headlightsOn?: boolean;
}

interface Palette {
  light: string;
  mid: string;
  dark: string;
  roofLight: string;
  roofDark: string;
  accent: string;
}

const PALETTES: Record<VehicleKind, Palette> = {
  P: {
    light: '#334155',
    mid: '#111827',
    dark: '#030712',
    roofLight: '#ffffff',
    roofDark: '#e2e8f0',
    accent: '#facc15',
  },
  T: {
    light: '#fde047',
    mid: '#eab308',
    dark: '#a16207',
    roofLight: '#fef9c3',
    roofDark: '#facc15',
    accent: '#0f172a',
  },
  A: {
    light: '#ffffff',
    mid: '#e2e8f0',
    dark: '#94a3b8',
    roofLight: '#ffffff',
    roofDark: '#f1f5f9',
    accent: '#dc2626',
  },
  B: {
    light: '#60a5fa',
    mid: '#2563eb',
    dark: '#1e3a8a',
    roofLight: '#93c5fd',
    roofDark: '#3b82f6',
    accent: '#dbeafe',
  },
  R: {
    light: '#f87171',
    mid: '#dc2626',
    dark: '#7f1d1d',
    roofLight: '#ef4444',
    roofDark: '#b91c1c',
    accent: '#fef2f2',
  },
  K: {
    light: '#52525b',
    mid: '#27272a',
    dark: '#09090b',
    roofLight: '#3f3f46',
    roofDark: '#18181b',
    accent: '#a1a1aa',
  },
  G: {
    light: '#4ade80',
    mid: '#15803d',
    dark: '#052e16',
    roofLight: '#22c55e',
    roofDark: '#166534',
    accent: '#dcfce7',
  },
  C: {
    light: '#5eead4',
    mid: '#0d9488',
    dark: '#115e59',
    roofLight: '#99f6e4',
    roofDark: '#14b8a6',
    accent: '#0f172a',
  },
  O: {
    light: '#fbbf24',
    mid: '#d97706',
    dark: '#78350f',
    roofLight: '#fcd34d',
    roofDark: '#b45309',
    accent: '#fef3c7',
  },
  F: {
    light: '#ef4444',
    mid: '#b91c1c',
    dark: '#450a0a',
    roofLight: '#dc2626',
    roofDark: '#991b1b',
    accent: '#f8fafc',
  },
  Y: {
    light: '#fde047',
    mid: '#eab308',
    dark: '#854d0e',
    roofLight: '#fef08a',
    roofDark: '#ca8a04',
    accent: '#1e293b',
  },
  L: {
    light: '#93c5fd',
    mid: '#3b82f6',
    dark: '#1d4ed8',
    roofLight: '#f8fafc',
    roofDark: '#dbeafe',
    accent: '#38bdf8',
  },
  N: {
    light: '#4ade80',
    mid: '#16a34a',
    dark: '#14532d',
    roofLight: '#f8fafc',
    roofDark: '#dcfce7',
    accent: '#15803d',
  },
};

export const VehicleArt: React.FC<VehicleArtProps> = ({
  kind,
  dir,
  len,
  flashing = false,
  highlighted = false,
  headlightsOn = false,
}) => {
  const rawId = useId();
  const uid = rawId.replace(/:/g, '');
  const pal = PALETTES[kind];
  const isHorizontal = dir === 'h';

  const vw = isHorizontal ? len * 100 : 100;
  const vh = isHorizontal ? 100 : len * 100;
  const L = len * 100;

  // Police car & Ambulance face DOWN (+Y); other cars face UP (-Y) in vertical canonical space
  const facesDown = kind === 'P' || kind === 'A';

  return (
    <svg
      viewBox={`0 0 ${vw} ${vh}`}
      className="w-full h-full select-none pointer-events-none overflow-visible"
      aria-hidden="true"
    >
      <defs>
        {/* Multi-stop metallic body gradient */}
        <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0%" stopColor={pal.light} />
          <stop offset="45%" stopColor={pal.mid} />
          <stop offset="100%" stopColor={pal.dark} />
        </linearGradient>

        {/* Sculpted roof gradient */}
        <linearGradient id={`roof-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={pal.roofLight} />
          <stop offset="100%" stopColor={pal.roofDark} />
        </linearGradient>

        {/* Tinted glossy windshield glass */}
        <linearGradient id={`glass-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="45%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* Headlight beam cone */}
        <linearGradient id={`beam-down-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(254, 249, 195, 0.55)" />
          <stop offset="100%" stopColor="rgba(254, 249, 195, 0)" />
        </linearGradient>
        <linearGradient id={`beam-up-${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="rgba(254, 249, 195, 0.5)" />
          <stop offset="100%" stopColor="rgba(254, 249, 195, 0)" />
        </linearGradient>

        {/* Siren glow radial gradients */}
        <radialGradient id={`siren-r-${uid}`}>
          <stop offset="0%" stopColor="rgba(239,68,68,0.85)" />
          <stop offset="100%" stopColor="rgba(239,68,68,0)" />
        </radialGradient>
        <radialGradient id={`siren-b-${uid}`}>
          <stop offset="0%" stopColor="rgba(59,130,246,0.85)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0)" />
        </radialGradient>
      </defs>

      <g transform={isHorizontal ? `translate(0, 100) rotate(-90)` : undefined}>
        {/* Headlight beam cones when active / winning */}
        {(headlightsOn || flashing) && facesDown && (
          <g>
            <polygon points={`18,${L - 10} 34,${L - 10} 44,${L + 42} 8,${L + 42}`} fill={`url(#beam-down-${uid})`} />
            <polygon points={`66,${L - 10} 82,${L - 10} 92,${L + 42} 56,${L + 42}`} fill={`url(#beam-down-${uid})`} />
          </g>
        )}
        {headlightsOn && !facesDown && (
          <g>
            <polygon points="18,12 34,12 42,-34 10,-34" fill={`url(#beam-up-${uid})`} />
            <polygon points="66,12 82,12 90,-34 58,-34" fill={`url(#beam-up-${uid})`} />
          </g>
        )}

        {/* Ground contact shadow */}
        <rect
          x="10"
          y="12"
          width="82"
          height={L - 14}
          rx={len === 3 ? 13 : 18}
          fill="rgba(0,0,0,0.52)"
        />

        {/* Tires with subtle tread shoulders */}
        {[26, L - 52, ...(len === 3 ? [138] : [])].map((ty) => (
          <g key={ty}>
            <rect x="6" y={ty} width="7" height="26" rx="2.5" fill="#09090b" stroke="#27272a" strokeWidth="0.8" />
            <rect x="87" y={ty} width="7" height="26" rx="2.5" fill="#09090b" stroke="#27272a" strokeWidth="0.8" />
          </g>
        ))}

        {/* Side Mirrors (for cars/vans) */}
        {kind !== 'N' && (
          <g>
            <rect
              x="4"
              y={facesDown ? L - 68 : 52}
              width="7"
              height="10"
              rx="3"
              fill={pal.mid}
              stroke="rgba(0,0,0,0.45)"
              strokeWidth="1"
            />
            <rect
              x="89"
              y={facesDown ? L - 68 : 52}
              width="7"
              height="10"
              rx="3"
              fill={pal.mid}
              stroke="rgba(0,0,0,0.45)"
              strokeWidth="1"
            />
          </g>
        )}

        {/* Main sculpted chassis */}
        <rect
          x="11"
          y="7"
          width="78"
          height={L - 14}
          rx={len === 3 ? 12 : 17}
          fill={`url(#body-${uid})`}
          stroke={highlighted ? '#facc15' : 'rgba(255,255,255,0.22)'}
          strokeWidth={highlighted ? 3 : 1.4}
        />

        {/* Metallic bevel rim */}
        <rect
          x="14"
          y="10"
          width="72"
          height={L - 20}
          rx={len === 3 ? 9 : 14}
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
        />

        {/* ================= POLICE INTERCEPTOR (P) ================= */}
        {kind === 'P' && (
          <>
            {/* Push bull-bar at bottom front bumper */}
            <rect x="33" y={L - 8} width="34" height="5" rx="2" fill="#94a3b8" stroke="#0f172a" strokeWidth="1" />
            <rect x="38" y={L - 11} width="4" height="6" fill="#64748b" />
            <rect x="58" y={L - 11} width="4" height="6" fill="#64748b" />

            {/* White interceptor doors & roof zone */}
            <rect x="13" y="50" width="74" height="78" rx="9" fill={`url(#roof-${uid})`} />
            {/* Side black door trim accents */}
            <rect x="13" y="54" width="3" height="70" fill="#1e293b" opacity="0.35" />
            <rect x="84" y="54" width="3" height="70" fill="#1e293b" opacity="0.35" />

            {/* Rear & Front windshields */}
            <path d="M 24 36 L 76 36 L 71 54 L 29 54 Z" fill={`url(#glass-${uid})`} stroke="#475569" strokeWidth="1" />
            <path d="M 20 120 L 80 120 L 74 146 L 26 146 Z" fill={`url(#glass-${uid})`} stroke="#64748b" strokeWidth="1.2" />
            {/* Windshield specular sheen */}
            <polygon points="27,122 42,122 33,144 26,144" fill="rgba(255,255,255,0.16)" />

            {/* Side windows */}
            <rect x="19" y="60" width="5" height="54" rx="2" fill="#0f172a" />
            <rect x="76" y="60" width="5" height="54" rx="2" fill="#0f172a" />

            {/* Sculpted Hood & Police Shield Crest */}
            <path d="M 28 148 L 28 182 M 72 148 L 72 182" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
            <polygon points="50,154 58,161 55,172 45,172 42,161" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="50" cy="163" r="2.2" fill="#0f172a" />

            {/* Roof Antenna & Unit Number */}
            <circle cx="50" cy="64" r="2" fill="#334155" />

            {/* Siren Lightbar + Ambient Flash Halo */}
            {flashing && (
              <>
                <circle cx="34" cy="91" r="26" fill={`url(#siren-r-${uid})`} className="animate-siren-halo-red" />
                <circle cx="66" cy="91" r="26" fill={`url(#siren-b-${uid})`} className="animate-siren-halo-blue" />
              </>
            )}
            <rect x="19" y="82" width="62" height="16" rx="5" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.2" />
            <rect
              x="22"
              y="84.5"
              width="24"
              height="11"
              rx="3"
              fill="#ef4444"
              className={flashing ? 'animate-siren-red' : undefined}
            />
            <rect
              x="54"
              y="84.5"
              width="24"
              height="11"
              rx="3"
              fill="#3b82f6"
              className={flashing ? 'animate-siren-blue' : undefined}
            />
            <rect x="46" y="84.5" width="8" height="11" rx="1.5" fill="#f8fafc" />

            {/* Headlights (Bottom) & Taillights (Top) */}
            <rect x="16" y={L - 14} width="16" height="5" rx="2" fill="#fef08a" />
            <rect x="68" y={L - 14} width="16" height="5" rx="2" fill="#fef08a" />
            <rect x="17" y="9" width="15" height="4.5" rx="1.5" fill="#ef4444" />
            <rect x="68" y="9" width="15" height="4.5" rx="1.5" fill="#ef4444" />
          </>
        )}

        {/* ================= YELLOW TAXI (T) ================= */}
        {kind === 'T' && (
          <>
            {/* Hood grille & contours */}
            <path d="M 30 16 L 30 44 M 70 16 L 70 44" stroke="rgba(161,98,7,0.45)" strokeWidth="1.5" />
            {/* Checker stripe on hood & trunk */}
            <rect x="20" y="34" width="60" height="7" rx="1.5" fill="#0f172a" />
            {[22, 34, 46, 58, 70].map((cx) => (
              <rect key={cx} x={cx} y="35.5" width="6" height="4" fill="#fde047" />
            ))}
            {/* Front & Rear Windshields */}
            <path d="M 21 47 L 79 47 L 73 69 L 27 69 Z" fill={`url(#glass-${uid})`} stroke="#78350f" strokeWidth="1" />
            <polygon points="28,49 42,49 34,67 27,67" fill="rgba(255,255,255,0.16)" />
            <path d="M 26 126 L 74 126 L 69 144 L 31 144 Z" fill={`url(#glass-${uid})`} />

            {/* Side Windows */}
            <rect x="19" y="72" width="5" height="50" rx="2" fill="#0f172a" />
            <rect x="76" y="72" width="5" height="50" rx="2" fill="#0f172a" />

            {/* Sculpted Roof */}
            <rect x="25" y="69" width="50" height="57" rx="8" fill={`url(#roof-${uid})`} stroke="rgba(161,98,7,0.35)" strokeWidth="1" />
            {/* Glowing TAXI Roof Sign */}
            <rect x="31" y="88" width="38" height="15" rx="4" fill="#0f172a" stroke="#fef08a" strokeWidth="1.2" />
            <rect x="35" y="91" width="30" height="9" rx="2" fill="#fef9c3" />
            <line x1="41" y1="95.5" x2="59" y2="95.5" stroke="#0f172a" strokeWidth="1.8" strokeDasharray="3 2" />

            {/* Headlights & Taillights */}
            <rect x="16" y="10" width="16" height="5.5" rx="2" fill="#fef9c3" />
            <rect x="68" y="10" width="16" height="5.5" rx="2" fill="#fef9c3" />
            <rect x="17" y={L - 14} width="15" height="4.5" rx="1.5" fill="#ef4444" />
            <rect x="68" y={L - 14} width="15" height="4.5" rx="1.5" fill="#ef4444" />
          </>
        )}

        {/* ================= AMBULANCE (A) ================= */}
        {kind === 'A' && (
          <>
            {/* High-visibility red/orange rescue stripes */}
            <rect x="11" y="146" width="78" height="7" fill="#dc2626" />
            <rect x="11" y="22" width="78" height="5" fill="#dc2626" opacity="0.8" />
            {/* Cab front windshield (facing down) */}
            <path d="M 19 144 L 81 144 L 75 167 L 25 167 Z" fill={`url(#glass-${uid})`} stroke="#94a3b8" strokeWidth="1" />
            <polygon points="27,146 42,146 34,165 25,165" fill="rgba(255,255,255,0.16)" />

            {/* Rear Medical Box Roof */}
            <rect x="19" y="29" width="62" height="106" rx="7" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            {/* Roof AC unit */}
            <rect x="36" y="34" width="28" height="14" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
            {/* Red Cross Emblem */}
            <rect x="43.5" y="60" width="13" height="40" rx="2.5" fill="#dc2626" />
            <rect x="30" y="73.5" width="40" height="13" rx="2.5" fill="#dc2626" />
            {/* Emergency Lightbar */}
            <rect x="22" y="128" width="56" height="9" rx="3.5" fill="#1e293b" />
            <rect x="24" y="130" width="18" height="5" rx="1.5" fill="#ef4444" />
            <rect x="58" y="130" width="18" height="5" rx="1.5" fill="#ef4444" />
            <rect x="44" y="130" width="12" height="5" rx="1" fill="#f8fafc" />

            {/* Rear ambulance doors seam */}
            <line x1="50" y1="8" x2="50" y2="21" stroke="#64748b" strokeWidth="1.5" />
            {/* Headlights & Taillights */}
            <rect x="16" y={L - 14} width="16" height="5" rx="2" fill="#fef08a" />
            <rect x="68" y={L - 14} width="16" height="5" rx="2" fill="#fef08a" />
            <rect x="17" y="9" width="14" height="4.5" rx="1.5" fill="#ef4444" />
            <rect x="69" y="9" width="14" height="4.5" rx="1.5" fill="#ef4444" />
          </>
        )}

        {/* ================= PASSENGER CARS & PICKUP (B, R, K, C, O) ================= */}
        {(kind === 'B' || kind === 'R' || kind === 'K' || kind === 'C' || kind === 'O') && (
          <>
            {/* Hood sculpted crease lines */}
            <path d="M 30 15 L 27 42 M 70 15 L 73 42" stroke="rgba(255,255,255,0.16)" strokeWidth="1.4" />

            {/* Crimson Sports Car racing stripes & rear spoiler */}
            {kind === 'R' && (
              <>
                <rect x="40.5" y="9" width="6.5" height="182" fill="#ffffff" opacity="0.72" />
                <rect x="53" y="9" width="6.5" height="182" fill="#ffffff" opacity="0.72" />
                {/* Hood air intake */}
                <rect x="42" y="24" width="16" height="8" rx="2" fill="#450a0a" />
                {/* Rear carbon spoiler wing */}
                <rect x="14" y={L - 18} width="72" height="7" rx="2.5" fill="#18181b" stroke="#fca5a5" strokeWidth="0.8" />
              </>
            )}

            {/* Amber Pickup ribbed cargo bed & rollbar */}
            {kind === 'O' && (
              <>
                <rect x="18" y="114" width="64" height="68" rx="5" fill="#291509" stroke="#92400e" strokeWidth="2" />
                {[24, 34, 44, 54, 64, 74].map((bx) => (
                  <line key={bx} x1={bx} y1="119" x2={bx} y2="177" stroke="#451a03" strokeWidth="2.5" />
                ))}
                {/* Rollbar + offroad fog pods */}
                <rect x="19" y="109" width="62" height="6" rx="2.5" fill="#18181b" />
                <circle cx="34" cy="112" r="2.8" fill="#fef08a" />
                <circle cx="50" cy="112" r="2.8" fill="#fef08a" />
                <circle cx="66" cy="112" r="2.8" fill="#fef08a" />
              </>
            )}

            {/* Front windshield */}
            <path d="M 20 43 L 80 43 L 74 67 L 26 67 Z" fill={`url(#glass-${uid})`} stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
            <polygon points="27,45 43,45 35,65 26,65" fill="rgba(255,255,255,0.18)" />

            {/* Side windows */}
            <rect x="18" y="70" width="5" height={kind === 'O' ? 34 : 52} rx="2" fill="#0f172a" />
            <rect x="77" y="70" width="5" height={kind === 'O' ? 34 : 52} rx="2" fill="#0f172a" />

            {/* Roof */}
            <rect
              x="25"
              y="66"
              width="50"
              height={kind === 'O' ? 40 : 60}
              rx="9"
              fill={kind === 'C' ? '#0f172a' : `url(#roof-${uid})`}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1"
            />

            {/* Panoramic sunroof / roof rails */}
            {(kind === 'B' || kind === 'K') && (
              <>
                <rect x="33" y="75" width="34" height="28" rx="5" fill="#0f172a" opacity="0.65" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <rect x="27" y="70" width="2.5" height="50" rx="1" fill="#cbd5e1" opacity="0.6" />
                <rect x="70.5" y="70" width="2.5" height="50" rx="1" fill="#cbd5e1" opacity="0.6" />
              </>
            )}

            {/* Rear window */}
            {kind !== 'O' && (
              <path d="M 26 126 L 74 126 L 69 145 L 31 145 Z" fill={`url(#glass-${uid})`} />
            )}

            {/* Headlights & Taillights */}
            <rect x="16" y="10" width="16" height="5.5" rx="2" fill="#fef08a" />
            <rect x="68" y="10" width="16" height="5.5" rx="2" fill="#fef08a" />
            <rect x="17" y={L - 14} width="15" height="4.5" rx="1.5" fill="#ef4444" />
            <rect x="68" y={L - 14} width="15" height="4.5" rx="1.5" fill="#ef4444" />
          </>
        )}

        {/* ================= GREEN MAIL / POST VAN (G) ================= */}
        {kind === 'G' && (
          <>
            <path d="M 19 25 L 81 25 L 75 47 L 25 47 Z" fill={`url(#glass-${uid})`} />
            <polygon points="27,27 42,27 34,45 25,45" fill="rgba(255,255,255,0.16)" />
            <rect x="17" y="50" width="66" height="132" rx="7" fill={`url(#roof-${uid})`} stroke="#86efac" strokeWidth="1.2" />
            {/* Van roof structural ribs */}
            {[62, 74, 144, 156, 168].map((ry) => (
              <line key={ry} x1="23" y1={ry} x2="77" y2={ry} stroke="rgba(5,46,22,0.3)" strokeWidth="2" />
            ))}
            {/* Crisp Postal Emblem */}
            <rect x="29" y="92" width="42" height="30" rx="4" fill="#ffffff" stroke="#15803d" strokeWidth="1.5" />
            <path d="M 31 94 L 50 110 L 69 94" fill="none" stroke="#15803d" strokeWidth="2.8" strokeLinejoin="round" />
            {/* Rear double-door seam */}
            <line x1="50" y1="183" x2="50" y2="192" stroke="#052e16" strokeWidth="2" />
            <rect x="16" y="10" width="16" height="5" rx="2" fill="#fef08a" />
            <rect x="68" y="10" width="16" height="5" rx="2" fill="#fef08a" />
          </>
        )}

        {/* ================= FIRE TRUCK (F, len 3) ================= */}
        {kind === 'F' && (
          <>
            {/* Chrome front grille */}
            <rect x="28" y="8" width="44" height="5" rx="2" fill="#e2e8f0" />
            {/* Windshield */}
            <path d="M 18 22 L 82 22 L 77 45 L 23 45 Z" fill={`url(#glass-${uid})`} stroke="#fca5a5" strokeWidth="1" />
            <polygon points="25,24 41,24 33,43 23,43" fill="rgba(255,255,255,0.18)" />

            {/* Emergency lightbar */}
            <rect x="20" y="50" width="60" height="10" rx="3.5" fill="#1e293b" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="23" y="52" width="22" height="6" rx="2" fill="#ef4444" />
            <rect x="55" y="52" width="22" height="6" rx="2" fill="#ef4444" />
            <rect x="45" y="52" width="10" height="6" fill="#ffffff" />

            {/* Equipment deck & side compartments */}
            <rect x="16" y="66" width="68" height="218" rx="6" fill="#7f1d1d" stroke="#fca5a5" strokeWidth="1" />
            <rect x="14" y="78" width="6" height="190" rx="2" fill="#cbd5e1" />
            <rect x="80" y="78" width="6" height="190" rx="2" fill="#cbd5e1" />

            {/* Rotating ladder turntable & metallic extension ladder */}
            <circle cx="50" cy="252" r="18" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
            <rect x="31" y="76" width="7" height="196" rx="2.5" fill="#f8fafc" stroke="#64748b" strokeWidth="1" />
            <rect x="62" y="76" width="7" height="196" rx="2.5" fill="#f8fafc" stroke="#64748b" strokeWidth="1" />
            {[90, 110, 130, 150, 170, 190, 210, 230, 250].map((y) => (
              <rect key={y} x="36" y={y} width="28" height="4.5" rx="1" fill="#cbd5e1" />
            ))}
            <rect x="16" y="10" width="16" height="5" rx="2" fill="#fef08a" />
            <rect x="68" y="10" width="16" height="5" rx="2" fill="#fef08a" />
          </>
        )}

        {/* ================= SCHOOL BUS (Y, len 3) ================= */}
        {kind === 'Y' && (
          <>
            {/* Hood ridges */}
            <path d="M 30 14 L 30 24 M 70 14 L 70 24" stroke="#854d0e" strokeWidth="2" />
            <path d="M 18 24 L 82 24 L 77 46 L 23 46 Z" fill={`url(#glass-${uid})`} />
            <polygon points="26,26 42,26 34,44 24,44" fill="rgba(255,255,255,0.16)" />
            {/* Main yellow roof */}
            <rect x="17" y="50" width="66" height="232" rx="8" fill={`url(#roof-${uid})`} stroke="#a16207" strokeWidth="1.2" />
            {/* Black rub rails */}
            <rect x="12" y="56" width="4.5" height="220" rx="1.5" fill="#18181b" />
            <rect x="83.5" y="56" width="4.5" height="220" rx="1.5" fill="#18181b" />
            {/* Stop arm */}
            <rect x="8" y="64" width="4" height="14" rx="1.5" fill="#ef4444" />
            {/* Roof Emergency Hatches & Vents */}
            <rect x="31" y="80" width="38" height="34" rx="5" fill="#fef9c3" stroke="#ca8a04" strokeWidth="2" />
            <rect x="38" y="134" width="24" height="28" rx="4" fill="#eab308" stroke="#a16207" strokeWidth="1.5" />
            <rect x="31" y="182" width="38" height="34" rx="5" fill="#fef9c3" stroke="#ca8a04" strokeWidth="2" />
            <rect x="38" y="236" width="24" height="24" rx="4" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
            <rect x="16" y="10" width="16" height="5" rx="2" fill="#fef9c3" />
            <rect x="68" y="10" width="16" height="5" rx="2" fill="#fef9c3" />
          </>
        )}

        {/* ================= LUXURY COACH BUS (L, len 3) ================= */}
        {kind === 'L' && (
          <>
            {/* Wraparound panoramic front windshield */}
            <path d="M 16 20 Q 50 12 84 20 L 78 48 L 22 48 Z" fill={`url(#glass-${uid})`} stroke="#60a5fa" strokeWidth="1" />
            <polygon points="24,22 44,20 35,46 22,46" fill="rgba(255,255,255,0.22)" />
            {/* Roof shell */}
            <rect x="17" y="52" width="66" height="232" rx="10" fill={`url(#roof-${uid})`} stroke="#93c5fd" strokeWidth="1.2" />
            {/* Tinted skylight strip */}
            <rect x="44" y="58" width="12" height="218" rx="4" fill="#1e3a8a" opacity="0.2" />
            {/* Twin Aerodynamic Roof AC Pods */}
            <rect x="29" y="82" width="42" height="46" rx="8" fill="#60a5fa" stroke="#eff6ff" strokeWidth="1.5" />
            <rect x="35" y="90" width="30" height="30" rx="4" fill="#3b82f6" opacity="0.55" />
            <rect x="29" y="154" width="42" height="46" rx="8" fill="#60a5fa" stroke="#eff6ff" strokeWidth="1.5" />
            <rect x="35" y="162" width="30" height="30" rx="4" fill="#3b82f6" opacity="0.55" />
            <rect x="34" y="222" width="32" height="32" rx="6" fill="#93c5fd" />
            <rect x="16" y="10" width="16" height="5" rx="2" fill="#fef08a" />
            <rect x="68" y="10" width="16" height="5" rx="2" fill="#fef08a" />
          </>
        )}

        {/* ================= CARGO CONTAINER TRUCK (N, len 3) ================= */}
        {kind === 'N' && (
          <>
            {/* Tractor Cab */}
            <path d="M 19 22 L 81 22 L 75 44 L 25 44 Z" fill={`url(#glass-${uid})`} />
            <polygon points="26,24 41,24 33,42 25,42" fill="rgba(255,255,255,0.18)" />
            {/* Cab wind deflector */}
            <rect x="23" y="47" width="54" height="10" rx="3" fill="#15803d" />
            {/* Fifth-wheel hitch gap */}
            <rect x="20" y="58" width="60" height="9" fill="#09090b" />
            {/* Corrugated Container */}
            <rect x="14" y="67" width="72" height="220" rx="5" fill="#f8fafc" stroke="#16a34a" strokeWidth="2.8" />
            {/* Container corner castings */}
            <rect x="14" y="67" width="10" height="10" rx="2" fill="#16a34a" />
            <rect x="76" y="67" width="10" height="10" rx="2" fill="#16a34a" />
            <rect x="14" y="277" width="10" height="10" rx="2" fill="#16a34a" />
            <rect x="76" y="277" width="10" height="10" rx="2" fill="#16a34a" />
            {/* Corrugated ribs */}
            {[86, 106, 126, 146, 166, 186, 206, 226, 246, 266].map((y) => (
              <line key={y} x1="20" y1={y} x2="80" y2={y} stroke="#cbd5e1" strokeWidth="2.5" />
            ))}
            {/* Green logistics stripe */}
            <rect x="44" y="72" width="12" height="210" rx="2" fill="#22c55e" opacity="0.22" />
            <rect x="16" y="10" width="16" height="5" rx="2" fill="#fef08a" />
            <rect x="68" y="10" width="16" height="5" rx="2" fill="#fef08a" />
          </>
        )}
      </g>
    </svg>
  );
};
