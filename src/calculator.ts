// type Definitions = (typeof definitions)[number]

/* eslint-disable @typescript-eslint/no-explicit-any */
declare let katex: any;

// definition of a control
// [name, label, notation, expression, values, scaleFactor]
type ControlDefinition = readonly [string, string, string, string, ValueOfControls, number];

// initial value of control can be variety of types
type ValueOfControls = Readonly<[string] | [string, string] | [number] | [number, number]>;

// if scale factor is zero, the control is treated as string or HTMLElement
// if scale factor is not zero, the control is treated as number
// if expression is empty, the control is input

// extract definitions with scale factor zero, which is treated as string or HTMLElement
type StringControls<Definitions extends ControlDefinition> = Definitions extends readonly [
  string,
  string,
  string,
  string,
  ValueOfControls,
  0,
]
  ? Definitions
  : never;

// extract definitions with one value specified
type SingleValueControls<Definitions extends ControlDefinition> = Definitions extends readonly [
  string,
  string,
  string,
  string,
  Readonly<[string] | [number]>,
  number,
]
  ? Definitions
  : never;

type SingleStringControls<Definitions extends ControlDefinition> = SingleValueControls<
  StringControls<Definitions>
>;

type NumericControls<Definitions extends ControlDefinition> = Exclude<
  Definitions,
  StringControls<Definitions>
>;

type SingleNumericControls<Definitions extends ControlDefinition> = Exclude<
  SingleValueControls<Definitions>,
  SingleStringControls<Definitions>
>;

type KeyOfStringControls<Definitions extends ControlDefinition> =
  | SingleStringControls<Definitions>[0]
  | `${Exclude<StringControls<Definitions>[0], SingleStringControls<Definitions>[0]>}1`
  | `${Exclude<StringControls<Definitions>[0], SingleStringControls<Definitions>[0]>}2`;

type KeyOfNumericControls<Definitions extends ControlDefinition> =
  | SingleNumericControls<Definitions>[0]
  | `${Exclude<NumericControls<Definitions>[0], SingleNumericControls<Definitions>[0]>}1`
  | `${Exclude<NumericControls<Definitions>[0], SingleNumericControls<Definitions>[0]>}2`;

// accessor class for actual HTML input elements
export type ControlType<Definitions extends ControlDefinition> = {
  [key in KeyOfNumericControls<Definitions>]: number;
} & {
  [key in KeyOfStringControls<Definitions>]: string | HTMLElement;
};

//-----------------------------------------------------------------------------

// Calculator class
export class Calculator<Definitions extends ControlDefinition> {
  controls = {} as ControlType<Definitions>;
  html: HTMLElement;
  recalc_core?: () => void;

  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly titles: readonly string[],
    public readonly definitions: readonly Definitions[]
  ) {
    const titleRow = elem(
      'TR',
      '',
      titles.map((s) => elem('TH', localize(s)))
    );
    const thead = elem('THEAD', '', [titleRow]);
    const tbody = elem('TBODY', '', [
      // this.controls are filled in this.definition2html
      ...definitions.map(this.definition2html.bind(this) as (def: Definitions) => HTMLElement),
    ]);
    const attr = { border: '1', cellSpacing: '0', cellPadding: '2' };
    const table = elem('TABLE', '', [thead, tbody], attr);

    const heading = elem('H2', localize(title));
    const desc = elem('DIV', localize(description), [], { style: { maxWidth: '600px' } });
    const div = elem('DIV', '', [heading, desc, table]);
    this.html = div;
  }

  // generate HTML element from a definition and define accessor for it in this.controls
  definition2html(def: Definitions) {
    const [name, label, notation, expression, values, scale] = def;

    // n is the suffix of the control name
    // v is the initial value of the control
    const createControl = (n: '' | '1' | '2', v: number | string) => {
      if (expression != '') {
        let e: HTMLElement;
        // if expression is given, the control is to display the result
        // numeric if scale != 0, string or HTMLElement if scale == 0
        if (typeof v == 'number') {
          // if (scale == 0) throw new Error('scale factor must be specified for numeric value');
          e = elem('SPAN', String(v));
        } else {
          // if (scale != 0) throw new Error('scale factor must be zero for string or HTMLElement');
          e = elem('SPAN', v);
        }
        Object.defineProperty(this.controls, name + n, {
          get: () => (scale == 0 ? e.innerHTML : Number(e.innerHTML) * scale),
          set: (v) => {
            if (scale != 0) e.innerHTML = (v / scale).toPrecision(6);
            else if (v instanceof HTMLElement) {
              e.innerHTML = '';
              e.appendChild(v);
            } else {
              e.innerHTML = v;
            }
          },
        });
        return e;
      } else {
        // if expression is empty, the control is input
        const e = elem<HTMLInputElement>(
          'INPUT',
          '',
          [],
          {
            value: String(v),
            style: {
              textAlign: 'right',
              paddingRight: '0.2em',
              width: '4em',
            },
          },
          { change: () => this.recalc() }
        );
        Object.defineProperty(this.controls, name + n, {
          get: () => (scale == 0 ? e.value : Number(e.value) * scale),
          set: (v) => (e.value = scale == 0 ? v : (v / scale).toPrecision(6)),
        });
        return e;
      }
    };

    const values2controls = () =>
      values.length == 1
        ? [
            elem('TD', '', [createControl('', values[0])], {
              colSpan: '2',
              style: { textAlign: 'center' },
            }),
          ]
        : [
            elem('TD', '', [createControl('1', values[0])]),
            elem('TD', '', [createControl('2', values[1])]),
          ];

    const backgroundColor = expression != '' ? '#ffe' : '#eff';

    return elem(
      'TR',
      '',
      [
        elem('TD', localize(label)),
        elem('TD', katex2html(notation)),
        elem('TD', katex2html(expression)),
        ...values2controls(),
      ],
      { style: { backgroundColor } }
    );
  }

  recalc() {
    if (this.recalc_core) this.recalc_core();
  }
}

// Create a HTML DOM Element
export function elem<T = HTMLElement>(
  tag: string,
  innerHTML = '',
  children: HTMLElement[] = [],
  props: { [key: string]: string | { [key: string]: string } } = {},
  events: { [key: string]: (e: Event) => void } = {}
) {
  const result = document.createElement(tag);
  if (innerHTML != '') result.innerHTML = innerHTML;
  children.forEach((c) => result.appendChild(c));
  Object.entries(props).forEach(([k, v]) => {
    if (typeof v == 'string') {
      result[k] = v;
    } else {
      Object.entries(v).forEach(([k2, v2]) => (result[k][k2] = v2));
    }
  });
  Object.entries(events).forEach(([k, v]) => result.addEventListener(k, v));
  return result as T;
}

function katex2html(s: string) {
  return katex.renderToString(s, { throwOnError: false });
}

export function localize(s: string) {
  const sp = s.split('<>', 2);
  if (sp.length == 1) return s;
  if (navigator.languages.find((l) => l.startsWith('ja') || l.startsWith('en'))?.startsWith('ja'))
    return sp[1];
  return sp[0];
}
