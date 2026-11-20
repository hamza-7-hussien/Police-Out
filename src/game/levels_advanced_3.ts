import { LevelDef } from './types';
import { parseLevelCode } from './solver';
import { RawLevel, rotCCW } from './levels_beginner_1';

export const ADVANCED_3_RAW: RawLevel[] = [
  // Page 20 (305-320) - upright
  { id: 305, par: 32, code: 'Kh00,Gv02,Pv03,Yv11,Oh23,Bh32,Oh34,Bh40,Rh42,Av44,Oh52' },
  { id: 306, par: 31, code: 'Pv03,Oh04,Fv15,Kh22,Bv24,Ch30,Oh32,Av40,Tv41,Bh42,Gh44,Rh54' },
  { id: 307, par: 31, code: 'Bv02,Pv03,Oh04,Fv15,Rh22,Cv24,Ah30,Bh32,Gv41,Lh43,Yh53' },
  { id: 308, par: 33, code: 'Rh01,Pv03,Lv04,Tv11,Fv15,Oh22,Kh30,Bv32,Yh53' },
  { id: 309, par: 32, code: 'Cv00,Oh01,Gh03,Av12,Pv13,Oh14,Bh20,Kv24,Rv31,Oh32,Fv35,Nh42,Lh51' },
  { id: 310, par: 31, code: 'Lv00,Fv01,Pv03,Gh04,Bv12,Oh23,Kv25,Bh30,Tv32,Gv34,Av45,Oh51,Rh53' },
  { id: 311, par: 35, code: 'Oh00,Tv02,Pv03,Lv10,Fv11,Oh23,Bh32,Ch34,Kv44,Rv45,Ah50,Bh52' },
  { id: 312, par: 36, code: 'Kh00,Ov02,Pv03,Fv10,Lv11,Bh23,Ah32,Ch34,Bh40,Rh42,Tv44,Oh50,Gh52' },
  { id: 313, par: 31, code: 'Oh00,Pv03,Bv05,Cv10,Rv11,Yh22,Gv25,Gh31,Ah33,Tv40,Kv42,Lh53' },
  { id: 314, par: 36, code: 'Gv00,Yv01,Oh03,Bv05,Pv13,Cv20,Oh24,Lh31,Kv34,Ah40,Rh42,Ch54' },
  { id: 315, par: 40, code: 'Ov00,Fv02,Pv03,Ah04,Bh20,Yv25,Gh31,Bh33,Kv41,Lh42,Oh52' },
  { id: 316, par: 40, code: 'Fh00,Pv03,Yv12,Gh14,Oh20,Av25,Bh33,Cv40,Lh41,Ov44,Tv45' },
  { id: 317, par: 31, code: 'Yv00,Kv01,Ah03,Bv05,Pv13,Oh21,Fv32,Lh33,Oh40,Rh44,Ah50,Ch54' },
  { id: 318, par: 34, code: 'Pv03,Rh04,Gv12,Fv15,Oh23,Ch30,Oh32,Cv34,Bv41,Oh52,Ah54' },
  { id: 319, par: 30, code: 'Rv00,Cv01,Oh02,Bv04,Yv05,Pv13,Kv20,Bh21,Gv32,Fh33,Oh40,Oh52,Ah54' },
  { id: 320, par: 34, code: 'Kv02,Pv03,Rh04,Fv14,Lv15,Oh22,Bh30,Ch32,Av41,Oh52,Bh54' },

  // Page 21 (321-336) - upright
  { id: 321, par: 32, code: 'Ov00,Fv02,Pv03,Cv04,Yv15,Ch23,Rh30,Oh32,Kv34,Gv41,Ah53' },
  { id: 322, par: 35, code: 'Gh00,Pv03,Fv10,Ov11,Lh23,Ch32,Bh34,Tv42,Kv45,Ah50,Rh53' },
  { id: 323, par: 33, code: 'Rh00,Kv02,Tv10,Oh13,Ch21,Pv23,Bh24,Gh30,Cv32,Gh43,Fv35,Av41,Lh52' },
  { id: 324, par: 26, code: 'Bh02,Cv04,Nv05,Oh10,Pv13,Fv20,Rh21,Av31,Bh42,Oh44,Kh52,Oh54' },
  { id: 325, par: 34, code: 'Gv02,Pv03,Cv10,Oh23,Gv21,Ah32,Bh34,Oh40,Bh42,Tv44,Rh52' },
  { id: 326, par: 33, code: 'Bv02,Pv03,Bh04,Nv14,Kh22,Rh30,Oh32,Av40,Cv41,Oh42,Gh44' },
  { id: 327, par: 28, code: 'Rh01,Ch03,Nv12,Pv13,Kh24,Oh30,Bh33,Tv35,Av41,Gh43,Oh52,Bh54' },
  { id: 328, par: 34, code: 'Oh01,Pv03,Bh10,Av12,Cv20,Yv21,Lh23,Rh32,Gv34,Fv35,Bh42,Tv40,Gh51,Oh53' },
  { id: 329, par: 33, code: 'Bv02,Oh03,Fv05,Cv10,Cv14,Yh21,Ov30,Nv31,Pv33,Gh34,Lh53' },
  { id: 330, par: 39, code: 'Nh02,Bv05,Ov10,Fv12,Pv13,Rh24,Oh30,Gv35,Bv41,Yh42,Lh52' },
  { id: 331, par: 41, code: 'Pv03,Ch04,Fv11,Lv14,Gh22,Tv25,Kh40,Av42,Bv45,Oh50,Rh53' },
  { id: 332, par: 34, code: 'Bh00,Tv02,Pv03,Ov10,Fv11,Bh23,Gh32,Ah34,Kh41,Rh43,Ov45,Nh51' },
  { id: 333, par: 34, code: 'Ah00,Cv02,Pv03,Bv10,Nv11,Oh23,Rh32,Gh34,Bh41,Oh43,Kv45,Fh52' },
  { id: 334, par: 33, code: 'Rh01,Ov05,Kv11,Lh23,Fh30,Pv33,Bv42,Yh53' },
  { id: 335, par: 31, code: 'Rh01,Pv03,Lv04,Ov11,Oh22,Gh30,Cv32,Ah33,Fh43,Yh52' },
  { id: 336, par: 33, code: 'Bh01,Pv03,Lv04,Av11,Oh22,Rh30,Kv32,Ch34,Ov45,Fh52' },

  // Page 22 (337-352) - upright
  { id: 337, par: 31, code: 'Kv00,Nh02,Lh12,Oh20,Rv22,Pv23,Bv30,Oh34,Fh42,Cv45,Oh50,Ah52' },
  { id: 338, par: 42, code: 'Gv02,Pv03,Kh04,Tv10,Ov14,Ah22,Lv25,Bv30,Bh31,Rh33,Tv41,Fh42' },
  { id: 339, par: 33, code: 'Rv02,Nh03,Ov10,Fh13,Bh21,Pv23,Av24,Ov25,Kv30,Oh31,Gv41,Lh42,Cv45' },
  { id: 340, par: 31, code: 'Lv00,Pv03,Kh04,Rh11,Fv15,Tv22,Bh23,Nh40,Ov44,Bh52' },
  { id: 341, par: 36, code: 'Tv00,Fh02,Gv05,Lv12,Gh20,Pv23,Rv25,Bh30,Kv41,Ah44,Oh52,Bh54' },
  { id: 342, par: 36, code: 'Oh00,Kv02,Pv03,Yv11,Av20,Gh23,Bh32,Ch34,Oh40,Rh42,Cv44,Tv45,Lh51' },
  { id: 343, par: 36, code: 'Kh00,Ov02,Pv03,Lv10,Fv11,Oh23,Ah32,Ch34,Bh40,Rh42,Tv44,Nh51' },
  { id: 344, par: 31, code: 'Cv00,Nv01,Fh02,Ov05,Pv13,Kv20,Rh24,Yv32,Lh33,Oh50' },
  { id: 345, par: 35, code: 'Kv02,Fh03,Pv13,Oh14,Bv20,Oh21,Cv25,Bv31,Ah33,Lh42,Tv40,Rv45,Nh51' },
  { id: 346, par: 31, code: 'Kv00,Nv02,Fh03,Pv13,Ah20,Gv30,Cv31,Oh32,Bh34,Lh42,Tv45,Yh51' },
  { id: 347, par: 31, code: 'Nv00,Tv02,Pv03,Ch04,Lv14,Bh22,Fh30,Av41,Oh42,Bh44,Yh53' },
  { id: 348, par: 27, code: 'Lv01,Pv03,Rh04,Tv15,Bh22,Ov30,Ah31,Kh33,Cv35,Gv42,Bh43,Yh53' },
  { id: 349, par: 32, code: 'Ov00,Nh02,Av12,Pv13,Ch14,Bh20,Kh24,Rv32,Oh33,Fv35,Lh50' },
  { id: 350, par: 28, code: 'Ch01,Pv03,Nv11,Ov20,Ah23,Oh32,Rh34,Gh42,Kv44,Oh50,Bh52' },
  { id: 351, par: 31, code: 'Oh00,Ov02,Pv03,Fv11,Ah23,Nh33,Gh40,Bh42,Ov44,Lh51' },
  { id: 352, par: 38, code: 'Cv00,Oh01,Pv03,Bh11,Gv20,Lv21,Ov22,Fh23,Nv35,Rh42,Bv44,Oh50,Ah52' },

  // Page 23 (353-360) - rotated 90 CW in photo
  { id: 353, par: 41, code: rotCCW('Gh01,Cv03,Fv05,Oh11,Bv20,Yv21,Lh22,Ph34,Rv44,Ah50,Oh52') },
  { id: 354, par: 37, code: rotCCW('Nh03,Lv10,Gh12,Oh14,Bh21,Cv25,Rv32,Ph33,Bv43,Kh44,Fh50') },
  { id: 355, par: 31, code: rotCCW('Bv00,Oh01,Lh03,Ch11,Nh13,Bh20,Yv25,Fv32,Ph33,Gv43,Ah54') },
  { id: 356, par: 37, code: rotCCW('Bv02,Fh03,Rh10,Bv20,Ov21,Cv22,Gh23,Ov33,Ph34,Ov40,Av41,Kv45,Lh52') },
  { id: 357, par: 44, code: rotCCW('Lh01,Ov05,Gh10,Ov12,Lv21,Av23,Rh24,Nv30,Ph34,Oh43,Gv45,Fh51') },
  { id: 358, par: 36, code: rotCCW('Lh02,Av05,Rh11,Ov13,Kh20,Bv22,Nv31,Ph33,Ov35,Gh42,Bv44,Gh52') },
  { id: 359, par: 32, code: rotCCW('Oh01,Bh03,Yv10,Bh11,Ov13,Kv21,Rv22,Gh24,Ph33,Cv35,Av42,Nh53') },
  { id: 360, par: 32, code: rotCCW('Lv02,Fh03,Oh10,Kv20,Gh23,Nv25,Ph31,Rv33,Cv40,Gh41,Yh53') },
];

export const ADVANCED_3_LEVELS: LevelDef[] = ADVANCED_3_RAW.map((r) => ({
  id: r.id,
  difficulty: 'advanced',
  parMoves: r.par,
  vehicles: parseLevelCode(r.code),
}));
