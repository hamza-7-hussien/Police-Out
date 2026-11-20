import { LevelDef } from './types';
import { parseLevelCode } from './solver';
import { RawLevel } from './levels_beginner_1';

export const INTERMEDIATE_1_RAW: RawLevel[] = [
  // Page 06 (081-096) - upright
  { id: 81, par: 15, code: 'Pv13,Bh21,Kh24,Yv35,Gv42,Th43,Oh50,Ch53' },
  { id: 82, par: 15, code: 'Ov00,Cv01,Bh02,Kv04,Tv05,Av20,Rh21,Pv23,Gv31,Ov32,Nh43' },
  { id: 83, par: 17, code: 'Ov00,Rh01,Ch03,Oh11,Pv13,Bh14,Kv21,Fv22,Ah24,Gh33,Nv35,Bh40' },
  { id: 84, par: 16, code: 'Nv00,Fv01,Pv03,Lh23,Oh32,Rv35,Ah40,Bv42,Oh50,Th53' },
  { id: 85, par: 18, code: 'Ah00,Gv02,Pv03,Kv04,Fv05,Nv11,Lh22,Ch34,Bh40,Ov42,Yh53' },
  { id: 86, par: 18, code: 'Kv02,Ch03,Bh10,Pv13,Gv20,Oh21,Av31,Rh32,Th34,Fh43,Ch53' },
  { id: 87, par: 18, code: 'Pv03,Ch04,Oh11,Tv15,Yv20,Nv21,Bh22,Fv32,Lh43,Ah50' },
  { id: 88, par: 18, code: 'Tv02,Fh13,Oh21,Pv23,Cv25,Bh31,Rv41,Lh42,Av45' },
  { id: 89, par: 19, code: 'Cv00,Yv02,Pv03,Rh20,Ov30,Bv31,Gh32,Th34,Ah43,Tv45,Nh51' },
  { id: 90, par: 20, code: 'Bv01,Ah02,Bv04,Pv13,Th24,Kv30,Oh33,Fv35,Gh41,Ch43,Lh52' },
  { id: 91, par: 18, code: 'Tv00,Bh01,Ch03,Oh11,Pv13,Nv21,Th24,Ah32,Fv35,Lh52' },
  { id: 92, par: 17, code: 'Nv00,Rh01,Pv03,Av05,Oh11,Tv14,Lh21,Gv32,Kh33,Bv35,Oh40,Cv44,Fh50' },
  { id: 93, par: 16, code: 'Lh00,Pv03,Oh10,Av12,Nv21,Fh23,Ch33,Bh42,Kv45,Rh51,Gh53' },
  { id: 94, par: 20, code: 'Yv00,Ch03,Kv05,Bh13,Rh21,Pv23,Tv25,Bh30,Av32,Fh43,Nh52' },
  { id: 95, par: 18, code: 'Pv03,Bh04,Oh11,Tv21,Ah23,Ch33,Tv35,Nh41,Rv44,Fh51' },
  { id: 96, par: 17, code: 'Pv03,Th04,Fh10,Bv15,Yv21,Oh23,Nv30,Bh33,Gv35,Ch43,Lh53' },

  // Page 07 (097-112) - upright (097 booklet omitted printing P in the empty col 3 slot r2..3)
  { id: 97, par: 16, code: 'Fv00,Gv02,Bh03,Yh13,Oh21,Pv23,Kh24,Bh34,Oh40,Rh42,Av45,Ch53' },
  { id: 98, par: 16, code: 'Bh00,Tv02,Pv03,Oh04,Ah10,Kh14,Fv20,Rh21,Ch23,Nh32,Oh43,Bh50,Gh53' },
  { id: 99, par: 17, code: 'Rh00,Kv02,Pv03,Tv11,Bh14,Gh22,Ah24,Nh31,Cv34,Bh41,Fh53' },
  { id: 100, par: 18, code: 'Rv00,Oh01,Th04,Ah13,Kh20,Bv22,Pv23,Gv24,Oh30,Bv41,Lh52' },
  { id: 101, par: 21, code: 'Ah00,Pv03,Ov11,Kh14,Gh22,Bh24,Lv30,Nh31,Rv34,Fv35,Gh51,Oh53' },
  { id: 102, par: 23, code: 'Fv01,Bv02,Pv03,Th04,Oh22,Gh24,Ch30,Av32,Kv45,Rh51,Bh53' },
  { id: 103, par: 17, code: 'Ch00,Pv03,Fv10,Oh11,Kv21,Lh22,Ah40,Tv42,Cv44' },
  { id: 104, par: 21, code: 'Pv03,Tv12,Oh14,Fh23,Kh30,Bh32,Av34,Cv35,Lh41,Ch52,Rh54' },
  { id: 105, par: 21, code: 'Cv00,Rh01,Gh03,Tv05,Yh12,Ah20,Bv22,Pv23,Ov30,Nh42,Oh53' },
  { id: 106, par: 23, code: 'Bv01,Ah04,Yh12,Oh20,Pv23,Fv30,Oh34,Lh42,Cv45,Gh51,Ch53' },
  { id: 107, par: 22, code: 'Nh02,Ov12,Bh20,Pv23,Oh30,Gv32,Ah34,Kv41,Ch43,Tv45,Fh52' },
  { id: 108, par: 21, code: 'Ov00,Fv02,Kh13,Bv15,Gv20,Oh23,Gh31,Pv33,Av41,Rh44,Ch52,Oh54' },
  { id: 109, par: 22, code: 'Bh00,Nv02,Oh03,Rh10,Pv13,Ov20,Bv21,Ch24,Kv35,Av40,Lh42,Gh53' },
  { id: 110, par: 23, code: 'Yh00,Pv03,Bv04,Gv05,Lh10,Ov20,Rh22,Kv24,Ch31,Bv40,Av42,Fh43,Nh53' },
  { id: 111, par: 21, code: 'Fv00,Yv01,Cv02,Pv03,Bh04,Av14,Bv15,Oh22,Nh31,Rv34,Oh54' },
  { id: 112, par: 22, code: 'Rv02,Yh03,Gv10,Pv13,Tv14,Lv15,Oh21,Ah30,Kv34,Bv41,Ch52,Bh54' },

  // Page 08 (113-128) - upright
  { id: 113, par: 23, code: 'Fv01,Pv03,Yv04,Oh22,Gv31,Lh33,Kv40,Av45,Oh51' },
  { id: 114, par: 22, code: 'Bh00,Ov02,Kh03,Tv05,Pv13,Ah20,Rv22,Fv30,Yv31,Nh33,Ch42,Gh52' },
  { id: 115, par: 24, code: 'Kh00,Pv03,Fv05,Nv12,Rh20,Gh23,Ch30,Gv41,Bh44,Oh52,Rh54' },
  { id: 116, par: 21, code: 'Rv04,Nv05,Oh10,Ah12,Bv20,Kh21,Pv23,Tv40,Bv41,Lh43,Ch52,Oh54' },
  { id: 117, par: 23, code: 'Lv00,Fv01,Ah03,Kh13,Pv23,Bh24,Tv35,Rh41,Oh43,Gh51,Oh53' },
  { id: 118, par: 21, code: 'Lv01,Pv03,Th04,Fv15,Oh22,Kv24,Yh31,Av42,Gh44' },
  { id: 119, par: 22, code: 'Tv00,Fv01,Ch13,Kv20,Pv23,Oh24,Cv34,Bv35,Ah40,Rh42,Lh51' },
  { id: 120, par: 22, code: 'Kh00,Bh03,Ov05,Tv10,Fh21,Cv25,Rh30,Pv33,Gv41,Ah53' },
  { id: 121, par: 21, code: 'Rh00,Pv03,Fv04,Lv05,Ah10,Oh20,Bh22,Yh33,Tv40,Nh43,Gh52,Ch54' },
  { id: 122, par: 22, code: 'Lv00,Bv02,Th03,Fh21,Yv24,Ah30,Pv33,Bv41,Oh52,Ch54' },
  { id: 123, par: 22, code: 'Pv03,Ah04,Bv10,Cv11,Nv12,Gh23,Ov25,Tv30,Gv31,Bh33,Kv44,Rv45,Fh51' },
  { id: 124, par: 25, code: 'Fh00,Pv03,Tv04,Bv05,Cv10,Kv22,Ov25,Gh30,Av41,Ov42,Rh44,Lh53' },
  { id: 125, par: 25, code: 'Cv00,Bv02,Nh03,Pv13,Ov14,Gv15,Rh21,Tv30,Kv35,Av41,Lh42' },
  { id: 126, par: 15, code: 'Gv05,Bv12,Rh13,Oh20,Pv23,Kv24,Tv25,Ch31,Bv41,Fh43,Ah54' },
  { id: 127, par: 15, code: 'Th01,Pv03,Yv05,Av14,Ch20,Oh22,Rv31,Nv32,Bh34,Gv44,Kh50' },
  { id: 128, par: 16, code: 'Oh00,Rh02,Yv12,Pv13,Th14,Ah20,Lv25,Bv40,Fh42,Ch51,Bh53' },

  // Page 09 (129-144) - upright
  { id: 129, par: 19, code: 'Gv00,Oh02,Kh04,Pv13,Bh14,Rh20,Yv22,Gh24,Oh33,Fv35,Ah40,Lh52' },
  { id: 130, par: 21, code: 'Bh00,Tv02,Pv03,Kv04,Fv05,Nv11,Lh22,Ov32,Gh34,Ah40,Rh52,Ch54' },
  { id: 131, par: 15, code: 'Rh00,Pv03,Oh04,Bh10,Gh14,Fv20,Nh22,Lv35,Kh42,Gh50,Oh52' },
  { id: 132, par: 22, code: 'Oh00,Rv02,Pv03,Nv04,Cv11,Bh22,Av31,Oh32,Bh34,Th54' },
  { id: 133, par: 24, code: 'Kv00,Gv02,Fh13,Cv20,Pv23,Av25,Bh31,Ov41,Tv45,Lh52' },
  { id: 134, par: 20, code: 'Bh00,Ch03,Kv05,Bh11,Oh13,Fh20,Pv23,Nv24,Rv25,Av41,Oh42,Th52,Gh54' },
  { id: 135, par: 21, code: 'Av00,Fv01,Ch03,Pv13,Bh24,Oh30,Bh32,Kv34,Gv40,Rh51,Oh53' },
  { id: 136, par: 22, code: 'Kh00,Pv03,Oh04,Tv10,Oh11,Cv15,Lh22,Bh30,Av32,Bv41,Gh52,Rh54' },
  { id: 137, par: 24, code: 'Oh00,Cv02,Fh03,Bv10,Oh13,Yh23,Ov30,Gh31,Pv33,Bv41,Av45,Nh52' },
  { id: 138, par: 21, code: 'Bv02,Th03,Kh10,Pv13,Fv21,Ov22,Oh24,Bv35,Lh42,Gh53' },
  { id: 139, par: 21, code: 'Bv00,Fv01,Pv03,Av12,Ch14,Bh23,Ov25,Nh41,Gv45,Oh51' },
  { id: 140, par: 21, code: 'Oh00,Bv04,Rv05,Kv10,Lh11,Fv22,Pv23,Oh24,Bh30,Gv40,Av44,Ov45,Nh51' },
  { id: 141, par: 22, code: 'Nv01,Oh02,Bh04,Fh13,Ch23,Pv33,Gh34,Ah41,Bv44,Kv45,Oh50,Rh52' },
  { id: 142, par: 22, code: 'Pv03,Yv04,Kv05,Oh10,Ah21,Fv30,Cv31,Gh42,Bh44,Lh53' },
  { id: 143, par: 24, code: 'Rh00,Tv02,Pv03,Fv04,Bv10,Kv21,Oh22,Ah34,Ov41,Gh44,Gh52,Ch54' },
  { id: 144, par: 21, code: 'Fh00,Pv03,Kv04,Gv05,Bh10,Nv12,Oh24,Ch30,Tv41,Lh43,Yh53' },
];

export const INTERMEDIATE_1_LEVELS: LevelDef[] = INTERMEDIATE_1_RAW.map((r) => ({
  id: r.id,
  difficulty: 'intermediate',
  parMoves: r.par,
  vehicles: parseLevelCode(r.code),
}));
