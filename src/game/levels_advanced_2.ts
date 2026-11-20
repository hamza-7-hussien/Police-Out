import { LevelDef } from './types';
import { parseLevelCode } from './solver';
import { RawLevel, rotCCW } from './levels_beginner_1';

export const ADVANCED_2_RAW: RawLevel[] = [
  // Page 17 (257-272) - rotated 90 CW in photo
  { id: 257, par: 28, code: rotCCW('Gh00,Av02,Rv03,Tv05,Tv10,Lv11,Yh22,Bv33,Ph34,Cv40,Fh52') },
  { id: 258, par: 27, code: rotCCW('Ov00,Kh01,Av03,Bv04,Lv05,Rv12,Oh20,Gv23,Fv31,Bv32,Ph34,Cv44,Oh52') },
  { id: 259, par: 27, code: rotCCW('Oh00,Nv02,Ah04,Gv10,Kv11,Bh13,Rv15,Tv23,Ph34,Tv30,Ch42,Bv44,Fh50') },
  { id: 260, par: 26, code: rotCCW('Gh02,Rh04,Kh10,Ov12,Bv20,Fv21,Ah24,Ph33,Nv35,Kv40,Ch42,Oh51,Bh53') },
  { id: 261, par: 33, code: rotCCW('Ch02,Kh04,Rv10,Nv11,Oh12,Bv14,Ov22,Gv30,Ph33,Fv35,Av43,Lh50') },
  { id: 262, par: 31, code: rotCCW('Rv01,Lh02,Ov05,Nh12,Gv21,Kh24,Fv32,Ov33,Ph34,Ah40') },
  { id: 263, par: 30, code: rotCCW('Av02,Gh10,Rv21,Bv22,Ov23,Nv30,Ph34,Ov41,Fh42,Cv45,Kh52') },
  { id: 264, par: 31, code: rotCCW('Fv02,Bv03,Oh04,Bh10,Gv20,Av21,Oh23,Kv25,Ph32,Rv40,Ch42,Ov45,Lh52') },
  { id: 265, par: 33, code: rotCCW('Ov02,Bh04,Ah10,Cv15,Tv20,Lh22,Nv31,Gv32,Tv33,Ph34,Bv40,Fh52') },
  { id: 266, par: 34, code: rotCCW('Ov00,Ah11,Fv13,Rh20,Gv22,Ph34,Kv42,Oh43,Ov45,Gh50,Bh53') },
  { id: 267, par: 37, code: rotCCW('Tv02,Rh10,Bv20,Ov21,Kv22,Bv23,Ah24,Ph34,Ov40,Gv41,Fh42,Cv45,Lh52') },
  { id: 268, par: 37, code: rotCCW('Gh01,Bv03,Fv05,Nv21,Lh22,Tv32,Ph34,Ov44,Rh50,Bh52') },
  { id: 269, par: 33, code: rotCCW('Cv00,Lh03,Ov12,Gh13,Ov15,Rv20,Av21,Nv23,Ph34,Fh40,Bv44,Kh50,Bh52') },
  { id: 270, par: 26, code: rotCCW('Gv00,Lh03,Nh12,Ov15,Ah20,Cv22,Bh23,Fv31,Bv33,Ph34,Ov30,Yh53') },
  { id: 271, par: 44, code: rotCCW('Gv01,Fv02,Oh04,Nh13,Rv21,Kh24,Ph32,Cv35,Yv30,Ah41,Bv43,Oh54') },
  { id: 272, par: 35, code: rotCCW('Bv02,Oh10,Rv21,Gv22,Ov23,Kh24,Lv30,Ph34,Av41,Fh42,Bv45,Oh52') },

  // Page 18 (273-288) - rotated 90 CW in photo
  { id: 273, par: 34, code: rotCCW('Ov00,Oh01,Av03,Fv05,Oh11,Bv14,Bh20,Rv22,Ph34,Ch40,Gv45,Oh50,Kh52') },
  { id: 274, par: 39, code: rotCCW('Av02,Kh04,Oh10,Fv15,Nv21,Lh22,Ph33,Bv43,Oh44,Ch51,Gh54') },
  { id: 275, par: 32, code: rotCCW('Nv00,Bv03,Oh04,Ah21,Kh23,Lv25,Bv32,Ph33,Rv43,Fh50') },
  { id: 276, par: 31, code: rotCCW('Bh00,Ah02,Fh13,Bv20,Oh22,Gh24,Lv32,Ph33,Kv35,Rh40,Ov43,Oh54') },
  { id: 277, par: 44, code: rotCCW('Cv02,Gh03,Oh10,Lv20,Lv21,Rv22,Kv23,Oh24,Ph34,Nh42,Av45,Bh52') },
  { id: 278, par: 35, code: rotCCW('Lv01,Bh02,Oh04,Ah12,Rv14,Kh22,Gv32,Ph33,Bh40,Gv43,Fh50') },
  { id: 279, par: 31, code: rotCCW('Kh00,Rv02,Bv03,Ov10,Yh21,Fv25,Av30,Lv31,Ph33,Tv43,Oh54') },
  { id: 280, par: 35, code: rotCCW('Lv02,Rh10,Av13,Tv20,Bh00,Gh24,Ph32,Ov35,Fh42,Bv40,Ov41,Ch52,Kh54') },
  { id: 281, par: 33, code: rotCCW('Ov00,Nh01,Av04,Rv11,Lv22,Ch24,Gv30,Tv33,Ph34,Yh52') },
  { id: 282, par: 31, code: rotCCW('Rv00,Oh11,Cv13,Kh20,Bv22,Fv31,Ph33,Ov35,Gv42,Av43,Ch54') },
  { id: 283, par: 31, code: rotCCW('Ah01,Oh03,Nh10,Bv13,Rv20,Lv21,Oh24,Ph32,Yv34,Gv40,Fh51') },
  { id: 284, par: 32, code: rotCCW('Rv02,Yh03,Gh10,Lv13,Oh21,Fv30,Ph34,Kh41,Ah43,Nh51') },
  { id: 285, par: 31, code: rotCCW('Ah01,Rv03,Oh04,Fv10,Bv12,Yv21,Lh23,Ph33,Nv35,Gv42,Cv44,Kh50') },
  { id: 286, par: 31, code: rotCCW('Nh03,Gh11,Rv13,Oh14,Lh20,Cv25,Fv32,Ph33,Av41,Oh53') },
  { id: 287, par: 36, code: rotCCW('Ov00,Nh02,Av05,Yh12,Rv21,Cv22,Oh24,Bv33,Ph34,Gh40,Bv42,Oh50') },
  { id: 288, par: 38, code: rotCCW('Bv03,Oh04,Yv10,Ah11,Rv15,Cv21,Bh22,Fv32,Ph34,Gv41,Yh43,Nh53') },

  // Page 19 (289-304) - upright
  { id: 289, par: 38, code: 'Kh00,Pv03,Gh04,Kv10,Bh11,Lv22,Fh23,Gh30,Bv41,Oh43,Av45,Nh52' },
  { id: 290, par: 26, code: 'Cv00,Fv01,Pv03,Kh14,Ov12,Gv20,Rh23,Ov25,Nh41,Gv45,Lh51' },
  { id: 291, par: 31, code: 'Fv00,Gh01,Pv03,Bh04,Ov11,Lv15,Rh23,Yh31,Gv42,Nh43,Kh50,Oh54' },
  { id: 292, par: 32, code: 'Av02,Rh04,Bv10,Nh13,Oh21,Pv23,Cv24,Lv25,Kv30,Cv31,Fh42,Oh52,Oh54' },
  { id: 293, par: 46, code: 'Lh01,Bv04,Ov05,Ov10,Nv12,Pv13,Kh24,Bh30,Rv40,Fh42,Gv45,Yh52' },
  { id: 294, par: 30, code: 'Oh00,Pv03,Nv10,Rv11,Oh14,Lh22,Ch31,Ah33,Gh43,Bv42,Bh50,Kh53' },
  { id: 295, par: 31, code: 'Av00,Oh02,Ov04,Bv12,Pv13,Gh20,Kh24,Rv31,Fh32,Nv35,Ch42' },
  { id: 296, par: 35, code: 'Bh00,Cv02,Pv03,Fv11,Rh23,Kh32,Bh34,Lh41,Gv44,Av45,Oh50,Oh52' },
  { id: 297, par: 32, code: 'Rv02,Cv10,Nh13,Gh21,Pv23,Ov25,Ov30,Bh31,Av41,Rh43,Ov45,Lh52' },
  { id: 298, par: 40, code: 'Av02,Pv03,Oh10,Nv20,Bv21,Gh22,Rh24,Oh32,Fv35,Ch42,Lh51' },
  { id: 299, par: 42, code: 'Bh00,Ov02,Fv05,Oh10,Nv20,Ah21,Rh23,Ch31,Pv33,Bv41,Lh53' },
  { id: 300, par: 44, code: 'Ov00,Yh02,Av05,Fv12,Pv13,Rh24,Bh30,Bv35,Cv40,Kv41,Lh42,Oh52' },
  { id: 301, par: 33, code: 'Pv03,Oh04,Fv12,Ch14,Rh20,Lv25,Cv30,Kh33,Yh41,Ov44,Ah50,Gh52' },
  { id: 302, par: 27, code: 'Lv01,Gh03,Ov12,Oh13,Pv23,Rh24,Av34,Ov35,Bh40,Ch53' },
  { id: 303, par: 35, code: 'Fv00,Ah01,Pv03,Bh04,Cv11,Lv14,Oh22,Oh30,Rv32,Yh43,Gh52,Oh54' },
  { id: 304, par: 33, code: 'Kv02,Pv03,Bh04,Gh10,Ov14,Rv15,Av20,Fh21,Cv31,Lh33,Bv40,Oh54' },
];

export const ADVANCED_2_LEVELS: LevelDef[] = ADVANCED_2_RAW.map((r) => ({
  id: r.id,
  difficulty: 'advanced',
  parMoves: r.par,
  vehicles: parseLevelCode(r.code),
}));
