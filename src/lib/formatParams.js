// Format param definitions — the single source of truth for all URL formatting options.
// Adding a new entry here automatically surfaces it in the URL parser and the generator UI.
//
// Types:
//   'color8' — 8-digit RGBA hex string (e.g. "FF000080")
//   'number' — numeric value with min/max/unit

export const FORMAT_PARAMS = [
  {
    key: 'bg',
    label: 'Color',
    type: 'color8',
    default: null, // null = no background shape rendered
  },
  {
    key: 'bw',
    label: 'Width',
    type: 'number',
    default: 100,
    min: 0,
    max: 200,
    unit: '%',
    hint: '100 = matches sprite. ~110 covers item badge.',
  },
  {
    key: 'bh',
    label: 'Height',
    type: 'number',
    default: 100,
    min: 0,
    max: 200,
    unit: '%',
  },
  {
    key: 'br',
    label: 'Border Radius',
    type: 'number',
    default: 0,
    min: 0,
    max: 50,
    unit: '%',
    hint: '50 = circle',
  },
  {
    key: 'bf',
    label: 'Feather',
    type: 'number',
    default: 0,
    min: 0,
    max: 100,
    unit: '',
  },
  {
    key: 'bx',
    label: 'X Offset',
    type: 'number',
    default: 0,
    min: -100,
    max: 100,
    unit: '%',
    hint: 'Positive = right',
  },
  {
    key: 'by',
    label: 'Y Offset',
    type: 'number',
    default: 0,
    min: -100,
    max: 100,
    unit: '%',
    hint: 'Positive = down',
  },
];
