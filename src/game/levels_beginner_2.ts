import { LevelDef } from './types';
import { parseLevelCode } from './solver';
import type { RawLevel } from './levels_beginner_1';

export const BEGINNER_2_RAW: RawLevel[] = [
  // Page 04 (049-064)
  { id: 49, par: 15, code: 'Nh00,Pv03,Fv05,Lh10,Ov20,Gv22,Kh23,Rv42,Ch44,Oh50,Bh54' },
  { id: 50, par: 16, code: 'Gv00,Bv05,Fh12,Oh20,Pv23,Tv25,Ov30,Yv31,Nh43,Rh53' },
  { id: 51, par: 15, code: 'Fv00,Tv01,Pv03,Ch04,Yv14,Ov15,Gv21,Rh22,Oh32,Bv35,Kv42,Ah43,Bh50' },
  { id: 52, par: 20, code: 'Gh03,Bv02,Bv05,Ov10,Pv13,Rh21,Oh24,Kv31,Ch32,Fv34,Av40,Oh42,Lh51' },
  { id: 53, par: 16, code: 'Fv00,Lv01,Pv03,Oh14,Ah22,Bv24,Kv25,Ov42,Nh43,Ch50,Rh53' },
  { id: 54, par: 16, code: 'Oh00,Ov02,Pv03,Kv10,Rv11,Ah22,Ch24,Lh30,Fh53' },
  { id: 55, par: 15, code: 'Lv00,Pv03,Oh04,Oh11,Kh14,Yv21,Bh22,Av24,Fv35,Rv42,Bh43,Gh50,Ch53' },
  { id: 56, par: 15, code: 'Nh00,Pv03,Fv10,Lv11,Oh22,Bh24,Cv35,Gh41,Av44,Rh51' },
  { id: 57, par: 16, code: 'Oh01,Pv03,Oh04,Av12,Yv20,Bv21,Nh23,Rh32,Ov34,Fv35,Ov42,Kh50,Gh53' },
  { id: 58, par: 15, code: 'Th04,Bv12,Pv13,Gv14,Gv15,Ch20,Kv30,Ov32,Oh34,Av41,Ch43,Fh52' },
  { id: 59, par: 17, code: 'Oh00,Av02,Oh04,Gv10,Nh13,Ch21,Pv23,Ov25,Ov31,Fh43,Lh53' },
  { id: 60, par: 18, code: 'Gv00,Pv03,Av04,Bv15,Oh20,Ch22,Ov32,Fh33,Rh40,Lh52' },
  { id: 61, par: 15, code: 'Lh00,Pv03,Nv11,Oh14,Ch23,Bv25,Fh40,Kv45,Yh50' },
  { id: 62, par: 16, code: 'Kv00,Oh01,Ch03,Rh11,Pv13,Av21,Yv22,Bh24,Nh33,Gh40,Bv45' },
  { id: 63, par: 15, code: 'Kh00,Pv03,Ah04,Gh10,Nv14,Ov15,Bv21,Oh32,Tv40,Bv41,Rv35,Lh52' },
  { id: 64, par: 15, code: 'Oh03,Bh14,Pv13,Fh20,Av25,Gv31,Yv32,Oh33,Kh44,Ch53' },

  // Page 05 (065-080)
  { id: 65, par: 16, code: 'Bh00,Kh02,Gv04,Yv10,Lh11,Ch21,Pv23,Ov31,Nh43,Fh53' },
  { id: 66, par: 15, code: 'Pv03,Bh14,Fh21,Kv24,Tv25,Yh30,Nh43,Gv42,Rh53' },
  { id: 67, par: 16, code: 'Fv00,Pv03,Ch14,Rh22,Kv24,Tv25,Gh30,Oh32,Bh42,Ah44,Nh53' },
  { id: 68, par: 15, code: 'Bv01,Kh02,Cv05,Ch13,Oh20,Rv12,Pv23,Oh24,Nh30,Av40,Oh42,Fv34,Lh51' },
  { id: 69, par: 15, code: 'Kv01,Gv02,Pv03,Fv05,Gv21,Lh22,Ov32,Ah34,Bh40,Rh52,Oh54' },
  { id: 70, par: 16, code: 'Ch02,Bh10,Kv12,Oh13,Lv20,Nh23,Oh31,Pv33,Rv34,Av41,Fh53' },
  { id: 71, par: 17, code: 'Pv03,Fv05,Oh10,Gv20,Rv21,Bh23,Yh33,Lh43,Ch54' },
  { id: 72, par: 16, code: 'Oh00,Tv02,Pv03,Kh04,Bh10,Av14,Cv15,Fv20,Lh21,Gh34,Rh54' },
  { id: 73, par: 20, code: 'Oh00,Rh02,Cv04,Yh10,Pv13,Ov20,Bv21,Oh24,Gh33,Fv35,Bv40,Av44,Lh51' },
  { id: 74, par: 17, code: 'Fv00,Bv02,Pv03,Oh14,Ov22,Oh23,Bv25,Kh30,Oh33,Ah52,Gh54' },
  { id: 75, par: 18, code: 'Nv00,Fv01,Av02,Pv03,Ch22,Oh24,Oh30,Bv32,Gv45,Oh51,Bh53' },
  { id: 76, par: 19, code: 'Lh00,Pv03,Rh10,Oh14,Oh20,Ch22,Nv24,Bv25,Lh31,Gv40,Fh41,Oh52,Ah54' },
  { id: 77, par: 16, code: 'Oh00,Nv02,Bh03,Pv13,Rh20,Ch24,Av30,Fh42,Kv45,Gh53' },
  { id: 78, par: 15, code: 'Oh00,Ch02,Kv04,Yv05,Av11,Rh12,Pv23,Lh30,Bv40,Gh42,Bh44,Nh53' },
  { id: 79, par: 18, code: 'Bv00,Tv02,Lh03,Pv13,Oh24,Ch31,Ah33,Nh42,Fv35' },
  { id: 80, par: 16, code: 'Yv00,Bh01,Pv03,Oh04,Oh11,Bh14,Fh22,Nv25,Ch40,Gv42,Lh53' },
];

export const BEGINNER_2_LEVELS: LevelDef[] = BEGINNER_2_RAW.map((r) => ({
  id: r.id,
  difficulty: 'beginner',
  parMoves: r.par,
  vehicles: parseLevelCode(r.code),
}));
