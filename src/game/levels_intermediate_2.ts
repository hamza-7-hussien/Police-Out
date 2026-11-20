import { LevelDef } from './types';
import { parseLevelCode } from './solver';
import { RawLevel } from './levels_beginner_1';

export const INTERMEDIATE_2_RAW: RawLevel[] = [
  // Page 10 (145-160) - upright
  { id: 145, par: 23, code: 'Nh00,Rv05,Fv10,Kv12,Bh13,Yh23,Gh31,Pv33,Cv34,Ov41,Tv45,Lh52' },
  { id: 146, par: 22, code: 'Kh00,Pv03,Lv04,Yh10,Fv15,Ch20,Ov22,Ah30,Bh33,Tv40,Nh42,Rh53' },
  { id: 147, par: 24, code: 'Ov00,Rh01,Pv03,Fv05,Nv11,Tv14,Kv20,Bh22,Av32,Lh33,Bh40,Gv44,Oh50,Ch52' },
  { id: 148, par: 21, code: 'Ch00,Kh02,Tv05,Oh10,Gv12,Fv20,Lh23,Ah31,Pv33,Bv34,Rv35,Ov42,Nh53' },
  { id: 149, par: 23, code: 'Pv03,Ch10,Bh20,Kh23,Nv30,Ov31,Fh33,Gh43,Lh51' },
  { id: 150, par: 21, code: 'Tv00,Rh02,Bh04,Kv12,Lh13,Gv20,Pv23,Yv24,Nv25,Bh31,Av41,Gh42,Fh52' },
  { id: 151, par: 22, code: 'Kv00,Oh01,Pv03,Tv14,Yv15,Rv21,Bh22,Lh32,Bh40,Ov42,Gh44,Ah53' },
  { id: 152, par: 22, code: 'Kv00,Yv02,Pv13,Fv15,Bh20,Cv31,Lh32,Rv40,Oh43,Oh51,Bh53' },
  { id: 153, par: 21, code: 'Cv01,Lh02,Yv05,Pv13,Rh20,Nv30,Bv31,Gh32,Oh34,Ah42,Tv44,Oh51' },
  { id: 154, par: 22, code: 'Nv00,Lh02,Bv05,Pv13,Ah21,Fh33,Yv32,Gh40' },
  { id: 155, par: 22, code: 'Tv00,Ch03,Fv05,Oh11,Pv13,Ov14,Bh20,Nv22,Lh33,Ah40' },
  { id: 156, par: 25, code: 'Av05,Bv10,Pv13,Rh21,Oh24,Ov30,Gv31,Lh43,Fh53' },
  { id: 157, par: 25, code: 'Ov00,Av02,Ch03,Fh13,Pv23,Nv24,Bh31,Rv41,Kv45,Lh52' },
  { id: 158, par: 15, code: 'Ch00,Pv03,Av10,Rh11,Tv21,Yh23,Lh33,Fh42,Nh52' },
  { id: 159, par: 15, code: 'Ov02,Pv03,Bh04,Ah10,Bv14,Oh20,Ch22,Nv30,Kv32,Rh34,Gv41,Tv45,Fh52' },
  { id: 160, par: 16, code: 'Nv00,Bv01,Oh04,Fh13,Pv33,Rh34,Lh40,Kv44,Gv45,Oh50,Ch52' },

  // Page 11 (161-176) - upright
  { id: 161, par: 25, code: 'Gv00,Yv01,Bv02,Ch04,Ov15,Rh22,Oh30,Ov32,Pv33,Bv40,Av45,Fh52' },
  { id: 162, par: 17, code: 'Bh00,Ov02,Kh03,Ah10,Pv13,Ch20,Bv22,Fv31,Rh33,Nh42,Oh52,Gh54' },
  { id: 163, par: 26, code: 'Yh00,Av05,Nv10,Ov11,Kv12,Bh13,Fh23,Bh31,Pv33,Cv34,Gv41,Lh53' },
  { id: 164, par: 18, code: 'Rh01,Pv03,Av04,Lv05,Bv21,Oh22,Cv24,Bv41,Kh44,Oh52,Oh54' },
  { id: 165, par: 17, code: 'Cv00,Nv01,Bh03,Kh13,Rv20,Tv25,Pv33,Fv34,Ah41,Bv45,Gh52' },
  { id: 166, par: 21, code: 'Bh00,Pv03,Th04,Bv10,Oh11,Nv22,Fh23,Gh30,Ah34,Rv40,Kv45,Lh52' },
  { id: 167, par: 23, code: 'Nv00,Bv01,Fh03,Bv21,Oh22,Kh24,Pv33,Gh34,Tv42,Rv45,Ah50,Ch53' },
  { id: 168, par: 23, code: 'Bh02,Av04,Kh11,Pv13,Cv21,Rh24,Bh33,Fv35,Lh41,Oh51,Th53' },
  { id: 169, par: 23, code: 'Cv00,Rh01,Gh03,Tv05,Ah11,Pv13,Oh20,Lv22,Bh30,Bv41,Nh43,Kh52' },
  { id: 170, par: 24, code: 'Oh02,Av04,Gh11,Pv13,Bv21,Rh24,Kv30,Oh33,Fv35,Lh41,Bh51,Ch53' },
  { id: 171, par: 21, code: 'Ov00,Ah01,Pv03,Th04,Oh14,Nv21,Fh23,Lv35,Gh42,Kv44,Rh50,Oh52' },
  { id: 172, par: 16, code: 'Tv00,Lh13,Cv20,Bh21,Pv23,Rh24,Av31,Fv32,Kh43,Bv45,Oh50' },
  { id: 173, par: 18, code: 'Nv00,Bv02,Lh03,Pv13,Rh21,Kv25,Oh32,Bv42,Gh43,Tv45,Ah50' },
  { id: 174, par: 25, code: 'Yh00,Pv03,Nv05,Lv10,Tv21,Rh23,Ch32,Bh34,Bh40,Av42' },
  { id: 175, par: 23, code: 'Bv00,Yv01,Av02,Pv03,Bh04,Oh22,Ah24,Oh41,Rv44,Kv45,Gh50,Oh52' },
  { id: 176, par: 20, code: 'Yh02,Tv05,Gh10,Fv12,Bh13,Ah20,Pv23,Oh30,Bv41,Lh43,Ch52' },

  // Page 12 (177-192) - upright
  { id: 177, par: 26, code: 'Pv03,Ch04,Yv14,Oh22,Bh30,Bh32,Kv40,Gv41,Fh43,Oh54' },
  { id: 178, par: 26, code: 'Av00,Pv03,Oh04,Fv11,Ov12,Rv15,Kh23,Nh32,Tv35,Yh40,Bv44' },
  { id: 179, par: 15, code: 'Kh00,Nv02,Oh03,Cv10,Pv13,Gh24,Ov30,Bh31,Rh33,Fv35,Bh42,Ah52' },
  { id: 180, par: 15, code: 'Lv00,Rh01,Pv03,Bv11,Oh14,Fh22,Nv25,Kh41,Bv44,Yh50' },
  { id: 181, par: 23, code: 'Av00,Fv05,Lh12,Bh20,Pv23,Rv30,Yv31,Nh43,Gh52,Oh54' },
  { id: 182, par: 27, code: 'Fh02,Kv05,Ov10,Bv12,Oh13,Lh23,Gv30,Rh31,Pv33,Av41,Oh52,Gh54' },
  { id: 183, par: 18, code: 'Tv02,Pv03,Fv05,Ah10,Bh21,Oh23,Rv32,Kv41,Ch44,Bh54' },
  { id: 184, par: 22, code: 'Kh01,Pv03,Ov05,Ov11,Fv20,Bh22,Rh24,Bh31,Ah33,Lh43' },
  { id: 185, par: 27, code: 'Oh00,Kh02,Fv04,Lv05,Bv10,Bh21,Pv23,Ov30,Yv31,Ah34,Ch44,Gh52,Rh54' },
  { id: 186, par: 26, code: 'Pv03,Yv05,Th11,Bv14,Ah20,Oh22,Kv32,Bv41,Rh44,Oh52,Ch54' },
  { id: 187, par: 27, code: 'Bh00,Pv03,Nv10,Ah14,Ov21,Gh22,Fv24,Tv25,Bh32,Gh40,Kv42,Rv45,Oh53' },
  { id: 188, par: 28, code: 'Pv03,Gh04,Cv10,Yv11,Fv14,Oh22,Ov25,Bh32,Ov42,Lh43,Ah50' },
  { id: 189, par: 23, code: 'Fv02,Nh03,Rh10,Bv20,Ah23,Yv25,Oh31,Pv33,Tv40,Gh41,Lh52' },
  { id: 190, par: 26, code: 'Bv00,Oh01,Pv03,Fv12,Rh14,Oh23,Gv25,Ch30,Kv40,Bv41,Oh42,Ah44,Lh53' },
  { id: 191, par: 27, code: 'Rv00,Oh01,Pv03,Cv11,Nv12,Yh23,Bh30,Oh33,Fh53' },
  { id: 192, par: 29, code: 'Kv02,Rh03,Oh10,Pv13,Fv20,Bv21,Av22,Th24,Ch34,Lh42,Bv45,Yh52' },

  // Page 13 (193-208) - upright
  { id: 193, par: 27, code: 'Lh00,Pv03,Bh14,Rh20,Gh23,Yv25,Kv30,Fh32,Gv42,Oh43,Oh50,Ah53' },
  { id: 194, par: 27, code: 'Lh00,Pv03,Kv04,Fv05,Ov10,Gh11,Ov22,Bh23,Ah30,Ov41,Bh43,Rh52,Ch54' },
  { id: 195, par: 30, code: 'Fv01,Pv03,Oh04,Lv14,Tv20,Kv25,Ch31,Av40,Rh41,Bv45,Gh51,Oh53' },
  { id: 196, par: 28, code: 'Cv00,Bh01,Pv03,Nv05,Oh20,Rv22,Av31,Oh34,Ov44,Fh50' },
  { id: 197, par: 26, code: 'Kh00,Gv02,Pv03,Ah04,Oh10,Bh14,Cv20,Lh21,Fv25,Nv31,Oh42,Rh52,Gh54' },
  { id: 198, par: 26, code: 'Cv00,Oh01,Pv03,Nv11,Rv20,Gh22,Oh32,Bh34,Av45,Oh51,Gh53' },
  { id: 199, par: 26, code: 'Pv03,Nv12,Gh14,Oh20,Av30,Bh33,Fv35,Lh42,Rh50,Oh52' },
  { id: 200, par: 24, code: 'Av02,Oh03,Tv10,Fh13,Oh21,Pv23,Kv30,Bh31,Gv41,Lh42,Yh52' },
  { id: 201, par: 26, code: 'Cv00,Fv01,Pv03,Oh14,Bv20,Gh22,Bv25,Yh41,Av45,Nh51' },
  { id: 202, par: 29, code: 'Bh00,Pv03,Fv11,Rh23,Oh32,Gh34,Oh40,Kh42,Tv44,Bv45,Ah50' },
  { id: 203, par: 27, code: 'Lh03,Pv13,Gv15,Nh20,Bv24,Kv31,Ov35,Av42,Oh50,Gh54' },
  { id: 204, par: 26, code: 'Tv02,Pv03,Bh04,Ov10,Rh14,Lh22,Av25,Bh30,Gv32,Kv41,Ov45,Nh52' },
  { id: 205, par: 29, code: 'Gv02,Oh03,Bv15,Nv20,Ah21,Pv23,Gh34,Fh41,Cv44,Kv45,Oh50,Rh52' },
  { id: 206, par: 27, code: 'Yh02,Kv05,Oh10,Fv12,Pv13,Bh24,Ah30,Ov34,Bv41,Gh42,Oh52,Rh54' },
  { id: 207, par: 29, code: 'Rh01,Pv03,Fv11,Bv20,Oh23,Ch32,Ah34,Gh40,Bh42,Kv44,Tv45' },
  { id: 208, par: 29, code: 'Ov00,Bh01,Pv03,Fv05,Gv14,Av21,Oh22,Rh32,Tv41,Kv42,Gh44,Lh53' },
];

export const INTERMEDIATE_2_LEVELS: LevelDef[] = INTERMEDIATE_2_RAW.map((r) => ({
  id: r.id,
  difficulty: 'intermediate',
  parMoves: r.par,
  vehicles: parseLevelCode(r.code),
}));
