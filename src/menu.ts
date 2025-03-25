import { calc as internal_shift } from './internal_shift';
import { calc as internal_interval } from './internal_interval';
import { calc as helical_shift } from './helical_shift';
import { calc as helical_interval } from './helical_interval';
import { calc as bevel } from './bevel';
import { elem, localize } from './calculator';

export function generateMenu() {
  const heading1 = elem('H1', localize('Gear Calculator<>歯車計算機'));
  const heading2 = elem('H2', localize('Select Calculator<>計算機を選択'));
  const list = elem('UL');
  const calculators = [helical_shift, helical_interval, internal_shift, internal_interval, bevel];
  const doms = calculators.map((calc) => calc.html);
  const wrapper = elem('DIV', '', [doms[0]]);
  const page = Number(window.location.search.match(/calculator=(\d+)/)?.[1] ?? '0');
  calculators.forEach((calc, i) => {
    const label = elem('LABEL', localize(calc.title));
    const item = elem('LI', '', [label]);
    label.insertBefore(
      elem(
        'INPUT',
        '',
        [],
        { type: 'radio', name: 'calculator', ...(i == page ? { checked: 'true' } : {}) },
        {
          click: () => wrapper.replaceChild(doms[i], wrapper.firstChild!),
        }
      ),
      label.firstChild
    );
    list.appendChild(item);
    calc.recalc();
  });
  const container = elem('DIV', '', [heading1, heading2, list, wrapper]);
  return container;
}
