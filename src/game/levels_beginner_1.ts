import { LevelDef, VEHICLE_LENGTH } from './types';
import { parseLevelCode } from './solver';

export interface RawLevel {
  id: number;
  par: number;
  code: string;
}

export function rotCCW(rawCode: string): string {
  return rawCode
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((tok) => {
      const kind = tok[0] as keyof typeof VEHICLE_LENGTH;
      const rawDir = tok[1];
      const rr = Number(tok[2]);
      const rc = Number(tok[3]);
      const len = VEHICLE_LENGTH[kind];
      if (rawDir === 'h') {
        const col = rr;
        const row = 6 - (rc + len);
        return `${kind}v${row}${col}`;
      } else {
        const col = rr;
        const row = 5 - rc;
        return `${kind}h${row}${col}`;
      }
    })
    .join(',');
}

export const BEGINNER_1_RAW: RawLevel[] = [
  // Page 01 (001-016) - rotated 90 CW in photo
  { id: 1, par: 3, code: rotCCW('Rh00,Oh11,Ah23,Ph34,Lv33,Fh40') },
  { id: 2, par: 3, code: rotCCW('Oh04,Rh12,Bh24,Ph34,Tv23,Ah43') },
  { id: 3, par: 3, code: rotCCW('Rh03,Ov05,Ch13,Nv11,Lv32,Ph34,Fh53') },
  { id: 4, par: 4, code: rotCCW('Ah02,Tv04,Nv05,Fv10,Lv11,Cv22,Rh23,Ph34') },
  { id: 5, par: 4, code: rotCCW('Rh01,Nv04,Th22,Ph34,Lv32,Ov43,Ah40') },
  { id: 6, par: 5, code: rotCCW('Bv00,Fh13,Lv12,Ah20,Ov23,Ph34,Rh42,Tv40') },
  { id: 7, par: 5, code: rotCCW('Nv10,Fv11,Av22,Tv14,Lv33,Ph34') },
  { id: 8, par: 5, code: rotCCW('Bh11,Rh13,Tv15,Lv22,Av33,Ph34,Fh53') },
  { id: 9, par: 6, code: rotCCW('Oh03,Bh13,Rh24,Nv21,Fv22,Ov30,Ph34') },
  { id: 10, par: 6, code: rotCCW('Rh02,Ov04,Bv05,Nv20,Tv31,Fv22,Ph34,Ah44') },
  { id: 11, par: 6, code: rotCCW('Tv10,Yh13,Bv30,Ph32,Ov42,Ah50') },
  { id: 12, par: 7, code: rotCCW('Rh02,Oh12,Yv20,Bv31,Nv32,Av33,Ph34') },
  { id: 13, par: 7, code: rotCCW('Yh03,Rh10,Ov12,Fv21,Bh24,Av30,Ph32,Tv34') },
  { id: 14, par: 9, code: rotCCW('Ov03,Ah11,Fv21,Nh22,Ph34,Tv45,Yh51') },
  { id: 15, par: 7, code: rotCCW('Yh02,Nv10,Fv33,Ph34,Bh40,Ov42') },
  { id: 16, par: 8, code: rotCCW('Ah01,Tv03,Yh23,Fv31,Ph33,Ov43,Nv35') },

  // Page 02 (017-032) - rotated 90 CW in photo
  { id: 17, par: 8, code: rotCCW('Ov02,Lh03,Rh10,Bh21,Ah23,Fv30,Ph31') },
  { id: 18, par: 6, code: rotCCW('Fv03,Rh10,Ov12,Nv20,Bh24,Ph33,Ah43') },
  { id: 19, par: 8, code: rotCCW('Fh01,Ov04,Cv13,Nv21,Rh24,Av30,Ph33') },
  { id: 20, par: 9, code: rotCCW('Ah01,Ov03,Ch04,Fh23,Lv21,Ph33,Rh51') },
  { id: 21, par: 9, code: rotCCW('Ah00,Bh02,Rv04,Nv11,Th24,Ov33,Ph34,Ch52') },
  { id: 22, par: 10, code: rotCCW('Nv15,Fh21,Lv30,Ph32,Tv43,Rh54') },
  { id: 23, par: 10, code: rotCCW('Ah02,Tv05,Nv20,Lv22,Ph34') },
  { id: 24, par: 10, code: rotCCW('Fh10,Bv13,Ov14,Av20,Lv31,Ph33,Nh53') },
  { id: 25, par: 11, code: rotCCW('Bh10,Ov12,Rh23,Fv20,Ph32,Nv34') },
  { id: 26, par: 11, code: rotCCW('Bv04,Ah11,Ov13,Fv20,Nv22,Ph33,Tv35') },
  { id: 27, par: 11, code: rotCCW('Tv05,Ah13,Fv11,Bv23,Ph34,Ov43') },
  { id: 28, par: 11, code: rotCCW('Lh00,Rv03,Fh22,Yv20,Nv21,Ph33,Bh50') },
  { id: 29, par: 11, code: rotCCW('Nh02,Rh10,Ov12,Fv21,Ph32,Yv34,Bh51') },
  { id: 30, par: 11, code: rotCCW('Oh02,Bv04,Ah12,Nv21,Tv22,Ph34,Rv42') },
  { id: 31, par: 12, code: rotCCW('Ov01,Yh03,Av15,Bh20,Fv23,Ph34,Nv30') },
  { id: 32, par: 12, code: rotCCW('Yv10,Ah12,Tv14,Fv32,Ph34,Bh54') },

  // Page 03 (033-048) - upright
  { id: 33, par: 12, code: 'Pv03,Lv12,Oh20,Fh33,Rv30,Nh42,Bv45' },
  { id: 34, par: 12, code: 'Oh00,Bv02,Pv03,Ov11,Fh22,Nh42' },
  { id: 35, par: 13, code: 'Yv02,Fh03,Ch20,Pv23,Lh30,Tv41,Nh52' },
  { id: 36, par: 13, code: 'Pv03,Fv05,Oh10,Av20,Rh23,Nh33,Lh43' },
  { id: 37, par: 13, code: 'Kv02,Oh10,Pv13,Bv20,Fh32,Nh42' },
  { id: 38, par: 13, code: 'Pv03,Oh10,Kv20,Rv21,Fh22,Lh43,Oh53' },
  { id: 39, par: 13, code: 'Fv00,Pv03,Oh11,Av21,Lh23,Kh41,Bh43' },
  { id: 40, par: 14, code: 'Lv01,Pv03,Kh04,Oh22,Bh24,Ah34,Cv45,Rh50' },
  { id: 41, par: 17, code: 'Oh00,Pv03,Oh04,Bv10,Fv11,Kh14,Nh23,Av30,Rh32,Ov34,Ch41,Gh54' },
  { id: 42, par: 16, code: 'Kv00,Nh01,Bv04,Tv05,Yh11,Bv20,Pv23,Gv24,Ov25,Oh31,Av41,Fh53' },
  { id: 43, par: 19, code: 'Oh00,Av02,Pv03,Gv10,Ov14,Nv15,Ov21,Bh22,Kv41,Ch44,Bh52,Rh54' },
  { id: 44, par: 17, code: 'Yv00,Fh01,Av04,Gv11,Lv12,Pv13,Oh24,Oh30,Rh33,Bv35,Ch52,Oh54' },
  { id: 45, par: 15, code: 'Kv00,Rv01,Yh02,Nv05,Fv12,Oh20,Pv23,Bv31,Ch34,Oh42,Bv44,Gh50,Ah52' },
  { id: 46, par: 17, code: 'Fv00,Oh01,Pv03,Bv04,Kv05,Bh21,Rh23,Tv25,Ch30,Av32,Nh43,Gh51,Oh53' },
  { id: 47, par: 17, code: 'Bv00,Nv02,Fh03,Pv13,Ah14,Oh20,Yv25,Bv31,Lh42' },
  { id: 48, par: 15, code: 'Oh00,Bv02,Bv04,Av11,Kv20,Fh22,Oh31,Pv33,Gv41,Yh52' },
];

export const BEGINNER_1_LEVELS: LevelDef[] = BEGINNER_1_RAW.map((r) => ({
  id: r.id,
  difficulty: 'beginner',
  parMoves: r.par,
  vehicles: parseLevelCode(r.code),
}));
