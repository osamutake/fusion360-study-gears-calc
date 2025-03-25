import { Calculator } from './calculator';
import { inv, inverse_inv } from './involute';

const { tan, cos, PI, atan } = Math;

const title = 'Spur&helical gear: Calculate center distance<>平歯車・はすば歯車: 軸間距離を計算';

const description = `
<p>You can calculate center distance between spur or helical gears by entering the shift coefficient of the gears.</p>
<p>When using a 3D printer, it is possible to choose an irregular module to match the desired center distance, a function was added to enter the "target center distance" and calculate the "adjusted module".</p>
<p>This form basically does <a href="https://www.khkgears.co.jp/gear_technology/pdf/gijutu.pdf#page=23">this calculation</a> described in the "technical data of gear" by KHK Kohara Gear Industry Co., Ltd.</p>
<>
<p>平歯車・はすば歯車について、転位係数を入力して中心間距離を求められます。</p>
<p>3Dプリンタを使う場合は目的の中心間距離に合わせて変則的なモジュールを選ぶことが可能なので、 「目標中心間距離」を入れて「調整後モジュール」を計算する機能も付けました。</p>
<p>基本的には KHK 小原歯車工業さんの 歯車技術資料 にある <a href="https://www.khkgears.co.jp/gear_technology/pdf/gijutu.pdf#page=23">こちらの計算</a> を行うものです。</p>
`;

const titles = ['Item<>項目名', 'Notation<>記号', 'Expression<>計算式', 'Gear 1<>歯車1', 'Gear2<>歯車2'] as const;

const definitions = [
  // 入力
  ['mn', 'Normal module<>歯垂直モジュール', 'm_n', '', [3], 1],
  ['alphan', 'Normal pressure angle<>歯直角圧力角', '\\alpha_n', '', [20], PI / 180],
  ['beta', 'Reference cylinder helix angle<>基準円筒ねじれ角', '\\beta', '', [30], PI / 180],
  ['z', 'Number of teeth<>歯数', 'z', '', [12, 60], 1],
  ['xn', 'Normal shift coefficient<>歯直角転位係数', 'x_n', '', [0.09809, 0], 1],
  // 出力
  [
    'alphat',
    'Transverse pressure angle<>正面圧力角',
    '\\alpha_t',
    '\\tan^{-1}\\Big(\\frac{\\tan\\alpha_n}{\\cos\\beta}\\Big)',
    ['?'],
    PI / 180,
  ],
  [
    'invawt',
    'inv(αwt)<>インボリュートαwt',
    '\\mathrm{inv}\\,\\alpha_{wt}',
    '2\\tan\\alpha_n\\big(\\frac{x_{n1}+x_{n2}}{z_1+z_2}\\big)+\\mathrm{inv}\\,\\alpha_t',
    ['?'],
    1,
  ],
  [
    'alphawt',
    'Transverse working pressure angle<>正面噛み合い圧力角',
    '\\alpha_{wt}',
    '\\mathrm{inv}^{-1}\\,(\\mathrm{inv}\\,\\alpha_{wt})',
    ['?'],
    PI / 180,
  ],
  [
    'y',
    'Center distance adjustment coefficient<>中心距離修正係数',
    'y',
    '\\frac{z_1+z_2}{2\\cos\\beta}\\Big(\\frac{\\cos\\alpha_t}{\\cos\\alpha_{wt}}-1\\Big)',
    ['?'],
    1,
  ],
  ['a', 'Center distance<>中心距離', 'a', '\\Big(\\frac{z_1+z_2}{2\\cos\\beta}+y\\Big)m_n', ['?'], 1],
  ['d', 'Reference diameter<>基準円直径', 'd', '\\frac{zm_n}{\\cos\\beta}', ['?', '?'], 1],
  ['db', 'Base diameter<>基礎円直径', 'd_b', 'd\\cos\\alpha_t', ['?', '?'], 1],
  ['dw', 'Working pitch diameter<>噛合ピッチ円直径', 'd_w', '\\frac{d_b}{\\cos\\alpha_{wt}}', ['?', '?'], 1],
  [
    'ha',
    'Addendum<>歯末の丈',
    'h_a',
    '\\begin{aligned}h_{a1}=(1+y-x_{n2})m_n\\\\h_{a2}=(1+y-x_{n1})m_n\\end{aligned}',
    ['?', '?'],
    1,
  ],
  ['h', 'Tooth depth<>歯丈', 'h', '\\{2.25+y-(x_{n1}+x_{n2})\\}m_n', ['?'], 1],
  ['da', 'Tip radius<>歯先円直径', 'd_a', 'd+2h_a', ['?', '?'], 1],
  ['df', 'Root radius<>歯底円直径', 'd_f', 'd_a-2h', ['?', '?'], 1],
  ['ad', 'Preferential center radius<>目標中心距離', 'a_d', '', [130], 1],
  ['mm', 'Module after adjustment<>調整後モジュール', 'm_m', 'm_n a_d / a', ['?'], 1],
] as const;

export const calc = new Calculator(title, description, titles, definitions);

calc.recalc_core = () => {
  const c = calc.controls;
  c.alphat = atan(tan(c.alphan) / cos(c.beta));
  c.invawt = (2 * tan(c.alphan) * (c.xn1 + c.xn2)) / (c.z1 + c.z2) + inv(c.alphat);
  c.alphawt = inverse_inv(c.invawt);
  c.y = ((c.z1 + c.z2) / (2 * cos(c.beta))) * (cos(c.alphat) / cos(c.alphawt) - 1);
  c.a = ((c.z1 + c.z2) / (2 * cos(c.beta)) + c.y) * c.mn;
  c.d1 = (c.z1 * c.mn) / cos(c.beta);
  c.d2 = (c.z2 * c.mn) / cos(c.beta);
  c.db1 = c.d1 * cos(c.alphat);
  c.db2 = c.d2 * cos(c.alphat);
  c.dw1 = c.db1 / cos(c.alphawt);
  c.dw2 = c.db2 / cos(c.alphawt);
  c.ha1 = (1 + c.y - c.xn2) * c.mn;
  c.ha2 = (1 + c.y - c.xn1) * c.mn;
  c.h = (2.25 + c.y - (c.xn1 + c.xn2)) * c.mn;
  c.da1 = c.d1 + 2 * c.ha1;
  c.da2 = c.d2 + 2 * c.ha2;
  c.df1 = c.da1 - 2 * c.h;
  c.df2 = c.da2 - 2 * c.h;
  c.mm = (c.mn * c.ad) / c.a;
};
