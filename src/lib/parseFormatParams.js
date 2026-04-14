import { FORMAT_PARAMS } from './formatParams';

// Parses URL search params into a validated format config object.
// Returns null if the 'bg' param is absent (no background shape to render).
// All numeric params are clamped to their defined min/max.
export function parseFormatParams(searchParams) {
  const bgRaw = searchParams.get('bg');
  if (!bgRaw) return null;

  const result = {};
  for (const param of FORMAT_PARAMS) {
    const raw = searchParams.get(param.key);

    if (raw === null) {
      result[param.key] = param.default;
      continue;
    }

    if (param.type === 'color8') {
      result[param.key] = /^[0-9A-Fa-f]{8}$/.test(raw) ? raw.toUpperCase() : param.default;
    } else if (param.type === 'number') {
      const num = parseFloat(raw);
      result[param.key] = isNaN(num)
        ? param.default
        : Math.min(param.max, Math.max(param.min, num));
    }
  }

  return result;
}
