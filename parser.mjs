export function classify(value, expected = '') {
  const kind = /^\d{17}$/.test(value) ? 'extended UPC' : /^\d{12}$/.test(value) ? 'base UPC' : 'invalid';
  return {value, kind, matchesExpected: expected ? value === expected : null};
}
export function isPrefix(e, mode, custom) {
  if (mode === 'ctrl-b') return e.ctrlKey && !e.altKey && !e.metaKey && e.key.toLowerCase() === 'b';
  if (mode === 'stx') return e.key === '\u0002';
  if (mode === 'f9') return e.key === 'F9';
  return Boolean(custom) && e.key === custom && !e.ctrlKey && !e.altKey && !e.metaKey;
}
