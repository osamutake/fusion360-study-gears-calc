import { Calculator, localize } from './calculator';
import { inv, inverse_inv } from './involute';
const { tan, cos, acos, PI, atan } = Math;

const title = 'Internal gear: calculate center distance<>内歯車: 軸間距離を計算';

const description = `
<p>To support the case of helical internal gears, I added "helix angle" parameter to
<a href="https://www.khkgears.co.jp/gear_technology/pdf/gijutu.pdf#page=19">this calculation</a>
from "the gear technology data" document of KHK Kohara Gear Industry Co., Ltd.</p>
<p>The error check is intended to include:
<ul>
<li>the relationship between the base circle and the tip circle of the internal gear</li>
<li>Involute interference = the tip of the internal gear interferes with the root of the external gear</li>
<li>Trochoid interference = the tip of the internal gear interferes with the tip of the external gear</li>
</ul>
</p>
<p>Since this involute interference check does not assume that the small diameter gear is with undercut,
an error may occur even if the gear with undercut does not interfere. Please note that.</p>
<p>
When the base circle of the internal gear is larger than the tip circle for the normal tip length,
the calculator automatically shorten the addendum to make the tip circle coincides with the base circle
and continues the rest calculation.
<>
<p>はすばの場合に対応するため、 KHK 小原歯車工業さんの 歯車技術資料 にあった
<a href="https://www.khkgears.co.jp/gear_technology/pdf/gijutu.pdf#page=19">こちらの計算</a> に
ねじれ角の項目を追加たのが以下のものです。</p>
<p>エラーチェックは、
<ul>
<li>内歯車の基礎円と歯先円の大小関係</li>
<li>インボリュート干渉 = 内歯車の歯先が平歯車の歯元と干渉</li>
<li>トロコイド干渉 = 内歯車の歯先が平歯車の歯先と干渉</li>
</ul>
を見ているつもりです。
</p>
<p>個々で行われるインボリュート干渉チェックは小径歯車に切り下げが行われることを想定していないため、
切り下げが行われた歯車では干渉しない場合にもエラーが出てしまうことがありますのでご注意ください。</p>
<p>
通常の歯先の丈を指定して内歯車の基礎円が歯先円よりも大きくなった場合、
歯先の丈を短くして歯先円を大きく定義しなおせばかみ合い長が短くはなりますが
使えないことはないので、 歯先の丈の調整を行ったうえでの計算結果を表示するようにしています。
</p>
`;

const titles = ['Item<>項目名', 'Notation<>記号', 'Expression<>計算式', 'External<>外歯車', 'Internal<>内歯車'] as const;

const definitions = [
  // 入力
  ['mn', 'Normal module<>歯垂直モジュール', 'm_n', '', [3], 1],
  ['alphan', 'Normal pressure angle<>歯直角圧力角', '\\alpha_n', '', [20], PI / 180],
  ['beta', 'Reference cylinder helix angle<>基準円筒ねじれ角', '\\beta', '', [0], PI / 180],
  ['z', 'Number of teeth<>歯数', 'z', '', [16, 24], 1],
  ['xn', 'Normal shift coefficient<>歯直角転位係数', 'x_n', '', [0, 0.516], 1],
  ['ca', 'Addendum<>歯末の丈', 'c_a', '', [1, 1], 1],
  ['cf', 'Dedendum<>歯元の丈', 'c_f', '', [1.25, 1.25], 1],
  // 出力
  ['cam', 'Addendum (after adjustment)<>歯先の丈(切詰後)', "c_a'", `\\scriptsize ${localize('\\text{Adjusted to be}\\ <>')}d_b>=d${localize('<>\\ \\text{まで切詰}')}`, [1, 1], 0],
  [
    'cond_inv',
    'Involute limit<>ｲﾝﾎﾞﾘｭｰﾄ限界',
    '\\scriptsize \\frac{z_1}{z_2}\\ge',
    '\\scriptsize1-\\frac{\\tan(\\alpha_{a2})}{\\tan\\alpha_{wt}}, ' +
      '({\\tiny\\alpha_{a2}=\\cos^{-1}\\frac{d_{b2}}{d_{a2}}})',
    ['?'],
    0,
  ],
  [
    'cond_trochoid',
    'Trochoid limit<>ﾄﾛｺｲﾄﾞ限界',
    '\\scriptsize \\frac{z_1}{z_2}\\ge',
    '\\scriptsize \\frac{\\cos^{-1}\\frac{r_{a2}^2-r_{a1}^2+a^2}{2ar_{a2}}+' +
      '\\text{inv}\\,\\alpha_{a2}-\\text{inv}\\,\\alpha_{wt}}' +
      '{\\cos^{-1}\\frac{r_{a2}^2-r_{a1}^2-a^2}{2ar_{a1}}+' +
      '\\text{inv}\\,\\alpha_{a1}-\\text{inv}\\,\\alpha_{wt}}',
    ['?'],
    0,
  ],
  ['error', 'Error check<>エラーチェック', '-', '-', ['?'], 0],
  [
    'alphat',
    'Transverse pressure angle<>正面圧力角',
    '\\alpha_t',
    '\\scriptsize\\tan^{-1}\\big(\\frac{\\tan\\alpha_n}{\\cos\\beta}\\big)',
    ['?'],
    PI / 180,
  ],
  [
    'invawt',
    'inv(αwt)<>インボリュートαwt',
    '\\mathrm{inv}\\,\\alpha_{wt}',
    '\\scriptsize2\\tan\\alpha_n\\big(\\frac{x_{n2}-x_{n1}}{z_2-z_1}\\big)+\\mathrm{inv}\\,\\alpha_t',
    ['?'],
    1,
  ],
  [
    'alphawt',
    'Transverse working pressure angle<>正面噛み合い圧力角',
    '\\alpha_{wt}',
    '\\scriptsize\\mathrm{inv}^{-1}\\,(\\mathrm{inv}\\,\\alpha_{wt})',
    ['?'],
    PI / 180,
  ],
  [
    'y',
    'Center distance adjustment coefficient<>中心距離修正係数',
    'y',
    '\\scriptsize\\frac{z_2-z_1}{2\\cos\\beta}\\big(\\frac{\\cos\\alpha_t}{\\cos\\alpha_{wt}}-1\\big)',
    ['?'],
    1,
  ],
  ['a', 'Center distance<>中心距離', 'a', '\\scriptsize\\big(\\frac{z_2-z_1}{2\\cos\\beta}+y\\big)m_n', ['?'], 1],
  ['d', 'Reference diameter<>基準円直径', 'd', '\\frac{zm_n}{\\cos\\beta}', ['?', '?'], 1],
  ['db', 'Base diameter<>基礎円直径', 'd_b', '\\scriptsize d\\cos\\alpha_t', ['?', '?'], 1],
  ['dw', 'Working pitch diameter<>噛合ピッチ円直径', 'd_w', '\\frac{d_b}{\\cos\\alpha_{wt}}', ['?', '?'], 1],
  [
    'ha',
    'Addendum<>歯末の丈',
    'h_a',
    '\\scriptsize\\begin{aligned}h_{a1}=(c_{a1}+x_{n1})m_n\\\\h_{a2}=(c_{a2}-x_{n2})m_n\\end{aligned}',
    ['?', '?'],
    1,
  ],
  ['h', 'Tooth depth<>歯丈', 'h', '\\scriptsize(c_a+c_f)m_n', ['?', '?'], 1],
  [
    'da',
    'Tip radius<>歯先円直径',
    'd_a',
    '\\scriptsize\\begin{aligned}d_{a1}: d_1+2h_{a1}\\\\d_{a2}: d_2-2h_{a2}\\end{aligned}',
    ['?', '?'],
    1,
  ],
  [
    'df',
    'Root radius<>歯底円直径',
    'd_f',
    '\\scriptsize\\begin{aligned}d_{f1}: d_{a1}-2h_1\\\\d_{f2}: d_{a2}+2h_2\\end{aligned}',
    ['?', '?'],
    1,
  ],
  ['ad', 'Desired center distance<>目標中心距離', 'a_d', '', [13], 1],
  ['mm', 'Module after adjustment<>調整後モジュール', 'm_m', '\\scriptsize m_n a_d / a', ['?'], 1],
] as const;

export const calc = new Calculator(title, description, titles, definitions);

calc.recalc_core = () => {
  const msg = (s: string, c: string) =>
    `<font style="color: ${c}; font-weight: bold">${localize(s)}</font><br>`;
  // エラーチェック
  let error = '';

  const c = calc.controls;
  c.alphat = atan(tan(c.alphan) / cos(c.beta));
  c.invawt = (2 * tan(c.alphan) * (c.xn2 - c.xn1)) / (c.z2 - c.z1) + inv(c.alphat);
  c.alphawt = inverse_inv(c.invawt);
  c.y = ((c.z2 - c.z1) / (2 * cos(c.beta))) * (cos(c.alphat) / cos(c.alphawt) - 1);
  c.a = ((c.z2 - c.z1) / (2 * cos(c.beta)) + c.y) * c.mn;
  c.d1 = (c.z1 * c.mn) / cos(c.beta);
  c.d2 = (c.z2 * c.mn) / cos(c.beta);
  c.db1 = c.d1 * cos(c.alphat);
  c.db2 = c.d2 * cos(c.alphat);
  c.cam1 = String(c.ca1);
  let ca2 = c.ca2;
  if ((c.d2 - c.db2) / 2 / c.mn + c.xn2 < ca2) {
    error += msg('Shorten addendum<>歯先を切詰', 'red');
    ca2 = (c.d2 - c.db2 - 1e-6) / 2 / c.mn - c.xn2;
    c.cam2 = msg(ca2.toPrecision(6), 'red');
  } else {
    c.cam2 = String(ca2);
  }
  c.dw1 = c.db1 / cos(c.alphawt);
  c.dw2 = c.db2 / cos(c.alphawt);
  c.ha1 = (c.ca1 + c.xn1) * c.mn;
  c.ha2 = (ca2 - c.xn2) * c.mn;
  c.h1 = (c.ca1 + c.cf1) * c.mn;
  c.h2 = (ca2 + c.cf2) * c.mn;
  c.da1 = c.d1 + 2 * c.ha1;
  c.da2 = c.d2 - 2 * c.ha2;
  c.df1 = c.da1 - 2 * c.h1;
  c.df2 = c.da2 + 2 * c.h2;
  c.mm = (c.mn * c.ad) / c.a;

  const cond_inv = 1 - tan(acos(c.db2 / c.da2)) / tan(c.alphawt);
  const z_ratio = c.z1 / c.z2;
  if (z_ratio < cond_inv) {
    error += msg('Involute interference<>インボリュート干渉', 'red');
    c.cond_inv = msg(`${z_ratio.toPrecision(3)} < ${cond_inv.toPrecision(3)}`, 'red');
  } else {
    c.cond_inv = msg(`${z_ratio.toPrecision(3)} > ${cond_inv.toPrecision(3)}`, 'green');
  }

  const theta1 =
    acos((c.da2 ** 2 / 4 - c.da1 ** 2 / 4 - c.a ** 2) / (c.a * c.da1)) +
    (inv(acos(c.db1 / c.da1)) - c.invawt);
  const theta2 =
    acos((c.da2 ** 2 / 4 - c.da1 ** 2 / 4 + c.a ** 2) / (c.a * c.da2)) +
    (inv(acos(c.db2 / c.da2)) - c.invawt);
  const cond_trochoid = theta2 / theta1;
  if (z_ratio < cond_trochoid) {
    error += msg('Trochoid interference<>トロコイド干渉', 'red');
    c.cond_trochoid = msg(`${z_ratio.toPrecision(3)} < ${cond_trochoid.toPrecision(3)}`, 'red');
  } else {
    c.cond_trochoid = msg(`${z_ratio.toPrecision(3)} > ${cond_trochoid.toPrecision(3)}`, 'green');
  }

  if (error === '') {
    error = msg('No problem<>問題なし', 'green');
  }
  c.error = error;
}
