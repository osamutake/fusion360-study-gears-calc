import { Calculator } from './calculator';
import { inv } from './involute';
const { PI, atan, acos, cos, tan } = Math;

const tittle = 'Spur&helical gear: Calculate shift from center distance<>平歯車・はすば歯車: 中心間距離から転位量を計算' as const;
const description = `
<p>Enter the module, number of teeth, helix angle, and center distance to calculate
how much the two gears should be shifted to match the desired center distance.
You can design two gears that match the desired center distance by dividing the calculated
"Sum of normal shift" into two and allocating them to each gear.</p>
</p>
<p>
Internally, it performs
<a href="https://www.khkgears.co.jp/gear_technology/pdf/gijutu.pdf#page=24">this calculation</a>
described in the document "technical data of gear" by KHK Kohara Gear Industry Co., Ltd.</p>
<>
<p>
モジュール、歯数、ねじれ角と中心間距離を入れると、
２つの歯車を合わせてどれだけ転位すればよいかが算出されます。
求まった「歯直角転位係数和」を２つに分け、それぞれの歯車に振り分けることで
目的の中心間距離で噛み合う２つの歯車を設計できます。
</p>
<p>
内部では KHK 小原歯車工業さんの 歯車技術資料 にある、
<a href="https://www.khkgears.co.jp/gear_technology/pdf/gijutu.pdf#page=24">こちらの計算</a> 
を行っています。
` as const;

const titles = ['Item<>項目名', 'Notation<>記号', 'Expression<>計算式', 'Gear 1<>歯車1', 'Gear 2<>歯車2'] as const;

const definitions = [
  // 入力
  ['mn', 'Normal module<>歯垂直モジュール', 'm_n', '', [3], 1],
  ['alphan', 'Normal pressure angle<>歯直角圧力角', '\\alpha_n', '', [20], PI / 180],
  ['beta', 'Reference cylinder helix angle<>基準円筒ねじれ角', '\\beta', '', [30], PI / 180],
  ['z', 'Number of teeth<>歯数', 'z', '', [12, 60], 1],
  ['a', 'Center distance<>中心距離', 'a', '', [125], 1],
  // 出力
  [
    'alphat',
    'Transverse pressure angle<>正面圧力角',
    '\\alpha_t',
    '\\tan^{-1}\\Big(\\frac{\\tan\\alpha_n}{\\cos\\beta}\\Big)',
    ['?'],
    PI / 180,
  ],
  ['y', 'Central distance adjustment coefficient<>中心距離修正係数', 'y', '\\frac{a}{m_n}-\\frac{z_1+z_2}{2\\cos\\beta}', ['?'], 1],
  [
    'alphawt',
    'Transverse working pressure angle<>正面噛み合い圧力角',
    '\\alpha_{wt}',
    '\\cos^{-1}\\Big(\\frac{\\cos\\alpha_t}{\\frac{2y\\cos\\beta}{z_1+z_2}+1}\\Big)',
    ['?'],
    PI / 180,
  ],
  [
    'sumxn',
    'Sum fo normal shift (module as unit)<>歯直角転位係数和',
    'x_{n1}+x_{n2}',
    '\\frac{(z_1+z_2)(\\mathrm{inv}\\,\\alpha_{wt}-\\mathrm{inv}\\,\\alpha_t)}{2\\tan\\alpha_n}',
    ['?'],
    1,
  ],
  ['sumxnmm', 'Sum fo normal shift (distance)<>転位の和 (距離)', '(x_{n1}+x_{n2})m_n', '(x_{n1}+x_{n2})m_n', ['?'], 1],
] as const;

export const calc = new Calculator(tittle, description, titles, definitions);

calc.recalc_core = () => {
  const c = calc.controls;
  c.alphat = atan(tan(c.alphan) / cos(c.beta));
  c.y = c.a / c.mn - (c.z1 + c.z2) / (2 * cos(c.beta));
  c.alphawt = acos(cos(c.alphat) / ((2 * c.y * cos(c.beta)) / (c.z1 + c.z2) + 1));
  c.sumxn = ((c.z1 + c.z2) * (inv(c.alphawt) - inv(c.alphat))) / (2 * tan(c.alphan));
  c.sumxnmm = c.sumxn * c.mn;
}
