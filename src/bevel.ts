import { Calculator, localize } from './calculator';
const { PI, atan, cos, sin, tan } = Math;

const title = 'Bevel Gear<>かさ歯車';

const description = `
<p>Calculate the dimensions of bevel gears.</p>
<p>Internally, it performs
<a href="https://www.khkgears.co.jp/gear_technology/pdf/gijutu.pdf#page=31">this calculation</a>
described in the document "technical data of gear" by KHK Kohara Gear Industry Co., Ltd.</p>
<>
<p>かさ歯車の寸法を計算します。</p>
<p>内部では、KHK 小原歯車工業さんの 歯車技術資料 にある
<a href="https://www.khkgears.co.jp/gear_technology/pdf/gijutu.pdf#page=31">こちらの計算</a> に
はすばへの対応を加えた計算を行います。</p>
<p>はすばへの対応に足りない部分が残っています。</p>
`;

const titles = [
  'Items<>項目名',
  'Notation<>記号',
  'Expression<>計算式',
  'External gear<>外歯車',
  'Internal gear<>内歯車',
] as const;

const definitions = [
  // 入力
  ['sigma', 'Angle between axes<>軸間角度', '\\Sigma', '', [90], PI / 180],
  ['m', 'Transverse module at the outer end<>外端正面モジュール', 'm', '', [3], 1],
  ['alphan', 'Normal pressure angle<>歯垂直圧力角', '\\alpha_n', '', [20], PI / 180],
  ['z', 'Number of teeth<>歯数', 'z', '', [20, 40], 1],
  ['betam', 'Helix angle<>ねじれ角', '\\beta_m', '', [35], PI / 180],
  [
    'alphat',
    'Transverse pressure angle<>正面圧力角',
    '\\alpha_t',
    '\\tan^{-1}\\big(\\frac{\\tan\\alpha_n}{\\cos\\beta_m}\\big)',
    ['?'],
    PI / 180,
  ],
  ['d', 'Reference diameter<>基準円直径', 'd', 'zm', ['?', '?'], 1],
  [
    'delta',
    'Pitch angle<>基準円錐角',
    '\\begin{aligned}\\delta_1\\\\\\delta_2\\end{aligned}',
    '\\begin{aligned}&\\tan^{-1}\\big({\\scriptsize\\frac{\\sin\\Sigma}{z_2/z_1+\\cos\\Sigma}}\\big)\\\\&\\Sigma-\\delta_1\\end{aligned}',
    ['?', '?'],
    PI / 180,
  ],
  ['r', 'Cone Distance<>円錐距離', 'R', 'd_2/2\\sin\\delta_2', ['?'], 1],
  ['b', 'Facewidth<>歯幅', 'b', '', [22], 1],
  ['warning', 'Facewidth warning<>歯幅警告', '', 'b \\le 0.3R\\ \\|\\ b \\le 10m', ['?'], 0],
  ['h', 'Tooth depth<>歯丈', 'h', '2.25m', ['?'], 1],
  ['ha', 'Addendum<>歯末の丈', 'h_a', '1.00m', ['?'], 1],
  ['hf', 'Dedendum<>歯元の丈', 'h_f', '1.25m', ['?'], 1],
  ['thetaf', 'Dedendum angle<>歯元角', '\\theta_f', '\\tan^{-1}(h_f/R)', ['?'], PI / 180],
  ['thetaa', 'Addendum angle<>歯末角', '\\theta_a', '\\tan^{^1}(h_a/R)', ['?'], PI / 180],
  ['deltaa', 'Tip angle<>歯先円錐角', '\\delta_a', '\\delta+\\theta_a', ['?', '?'], PI / 180],
  ['deltaf', 'Root angle<>歯底円錐角', '\\delta_f', '\\delta-\\theta_f', ['?', '?'], PI / 180],
  ['da', 'Tip diameter at the outer end<>外端歯先円直径', 'd_a', 'd+2h_a\\cos\\delta', ['?', '?'], 1],
  ['x', 'Distance to the tip at the outer end along axis<>外端歯先までの軸方向距離', 'X', 'R\\cos\\delta-h_a\\sin\\delta', ['?', '?'], 1],
  ['xb', 'Distance between tips<br>at the inner and outer ends along axis<>歯先間の軸方向距離', 'X_b', '\\frac{b\\cos\\delta_a}{\\cos\\theta_a}', ['?', '?'], 1],
  ['di', 'Tip diameter at the inner end<>内端歯先円直径', 'd_i', 'd_a-\\frac{2b\\sin\\delta_a}{\\cos\\theta_a}', ['?', '?'], 1],
] as const;

export const calc = new Calculator(title, description, titles, definitions);

calc.recalc_core = () => {
  const c = calc.controls;
  c.alphat = atan(tan(c.alphan) / cos(c.betam));
  c.d1 = c.z1 * c.m;
  c.d2 = c.z2 * c.m;
  c.delta1 = atan(sin(c.sigma) / (c.z2 / c.z1 + cos(c.sigma)));
  c.delta2 = c.sigma - c.delta1;
  c.r = c.d2 / (2 * sin(c.delta2));
  c.warning =
    c.b > 0.3 * c.r && c.b > 10 * c.m
      ? `<b style="color:red">${localize('Too large<>歯幅過大')}</b>`
      : `<span style="color:green">${localize('No problem<>なし')}</span>`;
  c.h = 2.25 * c.m;
  c.ha = 1.0 * c.m;
  c.hf = c.h - c.ha;
  c.thetaf = atan(c.hf / c.r);
  c.thetaf = atan(c.hf / c.r);
  c.thetaa = atan(c.ha / c.r);
  c.thetaa = atan(c.ha / c.r);
  c.deltaa1 = c.delta1 + c.thetaa;
  c.deltaa2 = c.delta2 + c.thetaa;
  c.deltaf1 = c.delta1 - c.thetaf;
  c.deltaf2 = c.delta2 - c.thetaf;
  c.da1 = c.d1 + 2 * c.ha * cos(c.delta1);
  c.da2 = c.d2 + 2 * c.ha * cos(c.delta2);
  c.x1 = c.r * cos(c.delta1) - c.ha * sin(c.delta1);
  c.x2 = c.r * cos(c.delta2) - c.ha * sin(c.delta2);
  c.xb1 = (c.b * cos(c.deltaa1)) / cos(c.thetaa);
  c.xb2 = (c.b * cos(c.deltaa2)) / cos(c.thetaa);
  c.di1 = c.da1 - (2 * c.b * sin(c.deltaa1)) / cos(c.thetaa);
  c.di2 = c.da2 - (2 * c.b * sin(c.deltaa2)) / cos(c.thetaa);
};
