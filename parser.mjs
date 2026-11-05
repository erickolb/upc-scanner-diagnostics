export function classify(value, expected = '') {
  const kind = /^\d{17}$/.test(value) ? 'extended UPC' : /^\d{12}$/.test(value) ? 'base UPC' : 'invalid';
  return {value, kind, matchesExpected: expected ? value === expected : null};
}
export function typingOutcome({value, capture, settingsChanged, active, scansBefore, scansAfter, backspace, deletionInput}) {
  if (!capture || settingsChanged || active || value.replace(/\r\n?/g, '\n') !== 'scan 123\ndone' || scansBefore !== scansAfter) return {outcome:'FAIL', caveat:null};
  return backspace || deletionInput ? {outcome:'PASS', caveat:null} : {outcome:'PASS WITH CAVEAT', caveat:'Correct final text and no false scans; Backspace/deletion event was not observed.'};
}
export function isPrefix(e, mode, custom) {
  if (mode === 'ctrl-b') return e.ctrlKey && !e.altKey && !e.metaKey && e.key.toLowerCase() === 'b';
  if (mode === 'stx') return e.key === '\u0002';
  if (mode === 'f9') return e.key === 'F9';
  return Boolean(custom) && e.key === custom && !e.ctrlKey && !e.altKey && !e.metaKey;
}
