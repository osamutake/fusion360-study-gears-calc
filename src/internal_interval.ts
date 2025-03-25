import { Calculator } from './calculator';
import { inv } from './involute';
const { PI, atan, acos, cos, tan } = Math;

const title = 'Internal gear: Calculate shift from center distance<>内歯車: 中心距離から転位を計算';

const description = `
<p>This form basically does
<a href="https://www.khkgears.co.jp/gear_technology/pdf/gijutu.pdf#page=24">this calculation</a> 
described in the "technical data of gear" by KHK Kohara Gear Industry Co., Ltd.</p>
<p>It has been slightly modified to support helical gears.</p>
<>
<p>KHK 小原歯車工業さんの 歯車技術資料 にある
<a href="https://www.khkgears.co.jp/gear_technology/pdf/gijutu.pdf#page=24">こちらの計算</a> を行います。</p>
<p>はすばの場合にも使えるよう少し変更しています。</p>
`;

const titles = ['Item<>項目名', 'Notation<>記号', 'Expression<>計算式', 'External Gear<>外歯車', 'Internal Gear<>内歯車'] as const;

const definitions = [
  // 入力
  ['mn', 'Normal module<>歯垂直モジュール', 'm_n', '', [3], 1],
  ['alphan', 'Normal pressure angle<>歯直角圧力角', '\\alpha_n', '', [20], PI / 180],
  ['beta', 'Reference cylinder helix angle<>基準円筒ねじれ角', '\\beta', '', [0], PI / 180],
  ['z', 'Number of teeth<>歯数', 'z', '', [16, 24], 1],
  ['a', 'Center distance<>中心距離', 'a', '', [13.1683], 1],
  // 出力
  [
    'alphat',
    'Transverse pressure angle<>正面圧力角',
    '\\alpha_t',
    '\\tan^{-1}\\Big(\\frac{\\tan\\alpha_n}{\\cos\\beta}\\Big)',
    ['?'],
    PI / 180,
  ],
  ['y', 'Central distance adjustment coefficient<>中心距離修正係数', 'y', '\\frac{a}{m_n}-\\frac{z_2-z_1}{2\\cos\\beta}', ['?'], 1],
  [
    'alphawt',
    'Transverse working pressure angle<>正面噛み合い圧力角',
    '\\alpha_{wt}',
    '\\cos^{-1}\\Big(\\frac{\\cos\\alpha_t}{\\frac{2y\\cos\\beta}{z_2-z_1}+1}\\Big)',
    ['?'],
    PI / 180,
  ],
  [
    'diffxn',
    'Normal shift difference (module as unit)<>歯直角転位係数差',
    'x_{n2}-x_{n1}',
    '\\frac{(z_2-z_1)(\\mathrm{inv}\\,\\alpha_{wt}-\\mathrm{inv}\\,\\alpha_t)}{2\\tan\\alpha_n}',
    ['?'],
    1,
  ],
  ['diffxnmm', 'Normal shift difference (distance)<>転位の差 (距離)', '(x_{n1}+x_{n2})m_n', '(x_{n1}+x_{n2})m_n', ['?'], 1],
] as const;

export const calc = new Calculator(title, description, titles, definitions);

calc.recalc_core = () => {
  const c = calc.controls;
  c.alphat = atan(tan(c.alphan) / cos(c.beta));
  c.y = c.a / c.mn - (c.z2 - c.z1) / (2 * cos(c.beta));
  c.alphawt = acos(cos(c.alphat) / ((2 * c.y * cos(c.beta)) / (c.z2 - c.z1) + 1));
  c.diffxn = ((c.z2 - c.z1) * (inv(c.alphawt) - inv(c.alphat))) / (2 * tan(c.alphan));
  c.diffxnmm = c.diffxn * c.mn;
};
