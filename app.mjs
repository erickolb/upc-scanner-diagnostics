import {classify, isPrefix} from './parser.mjs';
const $ = id => document.getElementById(id);
let active = false, buffer = '', timer, events = [], scans = [], activations = 0;
let scanFocus = null, backgroundThroughout = false, physicalPrefix = false;
let buttonThroughout = false, startActivations = 0, focusTests = [];
const mode = () => $('mode').checked ? 'capture' : 'observe';
function focusSnapshot() {
  const el = document.activeElement;
  return {element:el ? el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') : 'none',
    button:document.hasFocus() && !document.hidden && el === $('probe'),
    suitable:document.hasFocus() && !document.hidden && (el === document.body || el === document.documentElement || el === $('background-pad'))};
}
function updateFocus() {
  const focus = focusSnapshot();
  $('focus-state').className = 'indicator' + (focus.suitable ? ' good' : ' bad');
  $('focus-state').textContent = `${focus.suitable ? '☑' : '☐'} Focus: ${focus.element}${document.hasFocus() ? '' : ' (page inactive)'} — ${focus.suitable ? 'background ready' : 'focus the page background for this test'}`;
  if(active && !focus.suitable) backgroundThroughout = false;
  if(active && !focus.button) buttonThroughout = false;
  $('button-ready').className = 'indicator' + (focus.button && mode() === 'capture' ? ' good' : ' bad');
  $('button-ready').textContent = focus.button && mode() === 'capture' ? '☑ READY — test button focused; scan now.' : '☐ Not ready — enable Capture and focus the test button.';
}
for(const event of ['focusin','focusout','visibilitychange']) document.addEventListener(event, updateFocus);
window.addEventListener('focus',updateFocus); window.addEventListener('blur',updateFocus);
$('background-pad').onclick = () => {$('background-pad').focus(); updateFocus();};
updateFocus();
const status = text => $('status').textContent = text;
function reset(message) {
  if(active && message && !message.startsWith('Captured') && message !== 'Rejected invalid payload.') {
    $('capture-state').className='indicator bad'; $('capture-state').textContent='☐ ' + message;
    if(scanFocus?.button) {$('button-result').className='indicator bad'; $('button-result').textContent='☐ ' + message;}
    if(physicalPrefix) logFocusTest({at:new Date().toISOString(),outcome:'incomplete',reason:message,startFocus:scanFocus,endFocus:focusSnapshot()});
  }
  active = false; buffer = ''; clearTimeout(timer); if(message) status(message);
}
function arm() {clearTimeout(timer); timer = setTimeout(() => reset('Incomplete scan discarded after timeout.'), 2000);}
function start(fromScanner = false) {
  active = true; buffer = ''; physicalPrefix = fromScanner; scanFocus = focusSnapshot(); backgroundThroughout = scanFocus.suitable;
  buttonThroughout = scanFocus.button; startActivations = activations;
  if(scanFocus.button) {$('button-result').className='indicator'; $('button-result').textContent='☐ Button-focus test running; waiting for Enter…';}
  $('capture-state').className = 'indicator'; $('capture-state').textContent = '☐ Capturing; waiting for Enter…';
  $('captured-upc').textContent = 'Waiting for barcode digits…';
  arm(); status('Prefix detected. Capturing scan…');
}
function logFocusTest(result) {
  focusTests.push(result);
  $('test-log').textContent = focusTests.map(x => `${x.at} | ${x.useCase || x.startFocus?.element || 'unknown'} | ${x.outcome} | ${x.value || x.reason || ''}${x.activationsBefore !== undefined ? ` | button activations ${x.activationsBefore} → ${x.activationsAfter}` : ''}`).join('\n');
}
function record(e) {
  events.push({at:new Date().toISOString(),type:e.type,key:e.key,code:e.code,ctrl:e.ctrlKey,alt:e.altKey,shift:e.shiftKey,meta:e.metaKey,repeat:e.repeat,target:e.target.id || e.target.tagName,prevented:e.defaultPrevented});
  events = events.slice(-600);
  $('log').textContent = events.map(x => JSON.stringify(x)).join('\n');
  $('log').scrollTop = $('log').scrollHeight;
}
for (const type of ['keydown','keyup']) document.addEventListener(type, e => {
  if (mode() === 'capture') {
    if (type === 'keydown' && isPrefix(e, $('prefix').value, $('custom').value)) {
      e.preventDefault(); e.stopImmediatePropagation(); start(true);
    } else if (active) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (type === 'keydown') {
        if (e.key === 'Enter') {
          const endFocus = focusSnapshot();
          const scan = {...classify(buffer, $('expected').value.trim()), at:new Date().toISOString(), startFocus:scanFocus, endFocus,
            activationsBefore:startActivations, activationsAfter:activations,
            buttonPass:physicalPrefix && buttonThroughout && endFocus.button && activations === startActivations && /^\d{12}(\d{5})?$/.test(buffer),
            backgroundPass:physicalPrefix && backgroundThroughout && endFocus.suitable && /^\d{12}(\d{5})?$/.test(buffer)};
          if(scanFocus.button) {
            $('button-result').className = 'indicator ' + (scan.buttonPass ? 'good' : 'bad');
            $('button-result').textContent = scan.buttonPass ? `☑ PASS — ${scan.kind} captured with button focus; no button activation.` : '☐ FAIL — valid prefixed UPC, stable button focus, and unchanged activation count required.';
          }
          logFocusTest({...scan,useCase:scanFocus.button ? 'button focus' : scanFocus.suitable ? 'background focus' : 'other focus',outcome:scan.buttonPass || scan.backgroundPass ? 'PASS' : 'NOT PASSED'});
          $('captured-upc').textContent = buffer || '(empty)';
          $('capture-state').className = 'indicator ' + (scan.backgroundPass ? 'good' : 'bad');
          $('capture-state').textContent = scan.backgroundPass ? `☑ PASS — ${scan.kind} captured with background focus throughout.` : `☐ Background test not passed — ${scan.kind === 'invalid' ? 'invalid UPC' : !physicalPrefix ? 'simulated start, no scanner prefix' : 'background focus was not suitable throughout'}.`;
          scans.push(scan); $('results').textContent = scans.map(x => JSON.stringify(x)).join('\n');
          reset(scan.kind === 'invalid' ? 'Rejected invalid payload.' : `Captured ${scan.kind}. Expected match: ${scan.matchesExpected ?? 'not specified'}`);
        } else if (e.key === 'Escape') reset('Scan cancelled.');
        else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          buffer += e.key; if (buffer.length > 64) reset('Scan rejected: payload too long.'); else arm();
        }
      }
    }
  }
  record(e);
}, true);
for (const id of ['mode','prefix','custom']) $(id).addEventListener('change', () => {
  reset('Settings changed. Ready.');
  $('mode-label').textContent = mode() === 'capture' ? '— Capture enabled' : '— Observe only';
  updateFocus();
  $('capture-state').className='indicator'; $('capture-state').textContent='☐ Waiting for a prefixed scan with background focus.';
});
$('probe').onclick = () => $('clicks').textContent = `Activations: ${++activations}`;
$('interrupt').onclick = () => start(false);
$('clear').onclick = () => {reset('Cleared.'); events=[]; scans=[]; focusTests=[]; $('test-log').textContent='No focus tests completed.'; $('button-result').className='indicator'; $('button-result').textContent='☐ Button-focus test not completed.'; $('log').textContent=''; $('results').textContent='No completed scans.'; $('captured-upc').textContent='No UPC captured yet.'; $('capture-state').className='indicator'; $('capture-state').textContent='☐ Waiting for a prefixed scan with background focus.';};
$('download').onclick = () => {
  const blob = new Blob([JSON.stringify({userAgent:navigator.userAgent,mode:mode(),prefix:$('prefix').value,custom:$('custom').value,expected:$('expected').value,activations,focusTests,scans,events},null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href=url; a.download='scanner-diagnostics.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
};
