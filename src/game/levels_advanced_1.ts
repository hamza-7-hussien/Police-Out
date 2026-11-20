import { LevelDef } from './types';
import { parseLevelCode } from './solver';
import { RawLevel } from './levels_beginner_1';

export const ADVANCED_1_RAW: RawLevel[] = [
  // Page 14 (209-224) - upright
  { id: 209, par: 28, code: 'Fv01,Kv02,Pv03,Bh04,Rv15,Oh22,Gh30,Oh32,Cv35,Oh40,Bv42,Ah54' },
  { id: 210, par: 27, code: 'Lv00,Fv01,Pv03,Kh04,Tv15,Ah22,Nh32,Bv35,Tv42,Bh50,Rh54' },
  { id: 211, par: 27, code: 'Ov00,Rh01,Pv03,Fv05,Bh11,Kv21,Av22,Bh23,Oh34,Lh40,Gv44' },
  { id: 212, par: 29, code: 'Bv00,Bv01,Rv02,Kh03,Ov05,Pv13,Tv21,Oh24,Bh32,Fv34,Ah41,Nh50' },
  { id: 213, par: 27, code: 'Ov00,Ah01,Pv03,Kh04,Ov14,Ch20,Fv22,Gv25,Bh30,Tv41,Rv45,Lh52' },
  { id: 214, par: 27, code: 'Rh00,Tv02,Pv03,Nv05,Yv10,Cv14,Lh21,Av31,Bh32,Ch34,Kv42,Oh50' },
  { id: 215, par: 26, code: 'Lh01,Tv04,Kv10,Bh12,Ov22,Fh23,Oh30,Pv33,Bv40,Rv41,Ah52,Ch54' },
  { id: 216, par: 26, code: 'Gv02,Oh03,Ch10,Pv13,Fv21,Kv22,Rh24,Oh34,Lh42,Gv45,Bh53' },
  { id: 217, par: 29, code: 'Nv00,Pv03,Oh04,Fv14,Oh22,Cv25,Oh30,Gh32,Bv41,Ah42,Rh44' },
  { id: 218, par: 26, code: 'Pv03,Fv05,Nv10,Ah11,Lh22,Oh32,Bh34,Gh40,Tv42,Yh53' },
  { id: 219, par: 30, code: 'Tv00,Fh01,Ov04,Nv12,Pv13,Gh24,Bh30,Tv40,Av41,Lh42,Yh52' },
  { id: 220, par: 29, code: 'Bv00,Av02,Lh03,Fh13,Tv20,Pv23,Bv24,Ov25,Rh31,Gv41,Nh42,Cv45,Yh52' },
  { id: 221, par: 28, code: 'Av02,Pv03,Ch04,Ov10,Bh22,Fv25,Kh31,Oh33,Rv41,Lh53' },
  { id: 222, par: 29, code: 'Yv00,Ch01,Pv03,Bv11,Av12,Lh23,Oh30,Tv32,Rh33,Nh52' },
  { id: 223, par: 24, code: 'Bv00,Ov02,Pv03,Bh04,Ah14,Oh20,Kv22,Tv24,Nv25,Gv41,Fh42,Rh52' },
  { id: 224, par: 29, code: 'Fh02,Nv12,Rh13,Bh20,Pv23,Cv30,Rh34,Lh41,Bv44,Gv45,Oh50' },

  // Page 15 (225-240) - upright
  { id: 225, par: 25, code: 'Gv00,Yh03,Bv12,Lh13,Bh20,Pv23,Kv24,Ov25,Rh31,Ov41,Oh42,Av45,Fh52' },
  { id: 226, par: 27, code: 'Fh00,Pv03,Kh14,Ch20,Bh23,Lv25,Bv30,Nh32,Tv42,Rh43,Oh50,Gh54' },
  { id: 227, par: 24, code: 'Nv00,Yh02,Av05,Bh11,Pv13,Kv22,Ch24,Bh30,Gv41,Oh43,Oh52,Rh54' },
  { id: 228, par: 30, code: 'Bv00,Fv01,Pv03,Kh04,Gv12,Oh14,Rv20,Oh23,Cv25,Lh41,Bv34,Av45,Yh51' },
  { id: 229, par: 30, code: 'Ov00,Lh02,Fh12,Kh20,Rv22,Ah23,Pv33,Oh34,Nh40,Bv45,Bh51,Ch53' },
  { id: 230, par: 26, code: 'Lv00,Pv03,Th04,Oh11,Gv15,Rv22,Bh23,Ah34,Nh40,Kv45,Ch50' },
  { id: 231, par: 26, code: 'Bv00,Ch03,Oh11,Pv13,Rh20,Tv22,Kh24,Bv31,Ah33,Nv35,Lh42,Yh52' },
  { id: 232, par: 29, code: 'Kh00,Av05,Cv12,Pv13,Rh20,Tv31,Oh34,Gv44,Tv45,Fh51' },
  { id: 233, par: 26, code: 'Gv02,Bh03,Tv05,Oh10,Pv13,Cv20,Rh21,Ah24,Ov31,Kh32,Bh34,Nh43' },
  { id: 234, par: 24, code: 'Oh00,Bv02,Pv03,Lv04,Fv05,Gh20,Rh22,Oh34,Kv41,Bh44,Ah52,Ch54' },
  { id: 235, par: 27, code: 'Tv02,Pv03,Bh04,Ch10,Lv15,Nv20,Ah21,Oh23,Fh32,Rh52,Kh54' },
  { id: 236, par: 26, code: 'Ov02,Pv03,Rh04,Bh10,Ov15,Kh21,Oh23,Fv30,Av31,Lh33,Gh42,Bv44,Ch52' },
  { id: 237, par: 26, code: 'Ov00,Rh01,Ch03,Bv12,Pv13,Kv14,Gh20,Oh32,Ah34,Bv41,Nh42,Lh52' },
  { id: 238, par: 26, code: 'Tv04,Nv05,Bh10,Oh12,Lv20,Ch21,Pv23,Av32,Rv41,Fh43,Oh52,Kh54' },
  { id: 239, par: 26, code: 'Cv02,Pv03,Fv05,Yv10,Lh22,Oh32,Ah34,Gh40,Bv42,Nh53' },
  { id: 240, par: 22, code: 'Oh00,Kv02,Pv03,Oh14,Ah20,Rv22,Gh23,Fv25,Yv30,Bv41,Bh42,Ch52,Oh54' },

  // Page 16 (241-256) - upright
  { id: 241, par: 28, code: 'Av00,Gv02,Nh03,Pv13,Lv15,Oh20,Yv31,Fh32,Kh42,Bh52,Oh54' },
  { id: 242, par: 27, code: 'Av00,Ov02,Nh03,Pv13,Kh21,Rv25,Bv30,Ov31,Yh42,Tv45,Fh50' },
  { id: 243, par: 27, code: 'Kh00,Gv02,Th04,Fv10,Yh13,Bh21,Pv23,Nv24,Gv25,Av41,Bh42,Tv45,Lh52' },
  { id: 244, par: 29, code: 'Pv03,Ch04,Fv14,Bh22,Ah30,Ch32,Ov41,Kh44,Rh52,Oh54' },
  { id: 245, par: 27, code: 'Ov02,Pv03,Cv04,Fv05,Bh20,Av22,Nh33,Lv30,Yv31,Rh42,Gh52,Oh54' },
  { id: 246, par: 27, code: 'Pv03,Lv12,Kh14,Rh20,Cv30,Oh33,Yv35,Fh42,Oh50,Gh52' },
  { id: 247, par: 26, code: 'Pv03,Oh04,Yv11,Fv14,Ah22,Bh32,Kv42,Lh43,Bh50' },
  { id: 248, par: 26, code: 'Ov02,Tv10,Lh13,Bh21,Pv23,Rv25,Bv30,Ah31,Cv41,Kh42,Gv45,Fh52' },
  { id: 249, par: 29, code: 'Bv00,Kv02,Oh03,Ov05,Oh13,Bh21,Pv23,Ov30,Ah34,Nh43,Gh51,Rh54' },
  { id: 250, par: 26, code: 'Ov00,Gh01,Pv03,Th04,Bv14,Yv15,Ah20,Nh32,Bv41,Kv42,Rh44,Lh53' },
  { id: 251, par: 30, code: 'Cv00,Ov02,Nh03,Pv13,Kv14,Tv15,Av20,Bh21,Gh50,Rv45,Fh41,Oh52' },
  { id: 252, par: 29, code: 'Th02,Bh11,Pv13,Fv14,Gh20,Bv22,Cv30,Ov31,Ah42,Rh44' },
  { id: 253, par: 28, code: 'Lv00,Kv01,Rh02,Tv05,Pv13,Bv21,Ah24,Oh32,Fv34,Gh41,Nh50' },
  { id: 254, par: 29, code: 'Bv00,Fv02,Rh13,Gv15,Bh20,Oh23,Kv30,Oh31,Pv33,Bv41,Ah44,Lh52' },
  { id: 255, par: 24, code: 'Rv00,Th01,Pv03,Fv05,Cv14,Bv21,Ah22,Oh32,Gv40,Kv41,Oh44,Lh53' },
  { id: 256, par: 29, code: 'Oh00,Pv03,Fv10,Bv11,Lh22,Bh32,Gh34,Oh40,Av42,Yh53' },
];

export const ADVANCED_1_LEVELS: LevelDef[] = ADVANCED_1_RAW.map((r) => ({
  id: r.id,
  difficulty: 'advanced',
  parMoves: r.par,
  vehicles: parseLevelCode(r.code),
}));
