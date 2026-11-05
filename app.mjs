import {classify, isPrefix} from './parser.mjs';
const $ = id => document.getElementById(id);
let active = false, buffer = '', timer, events = [], scans = [], activations = 0;
const status = text => $('status').textContent = text;
function reset(message) {active = false; buffer = ''; clearTimeout(timer); if(message) status(message);}
function arm() {clearTimeout(timer); timer = setTimeout(() => reset('Incomplete scan discarded after timeout.'), 2000);}
function start() {active = true; buffer = ''; arm(); status('Prefix detected. Capturing scan…');}
function record(e) {
  events.push({at:new Date().toISOString(),type:e.type,key:e.key,code:e.code,ctrl:e.ctrlKey,alt:e.altKey,shift:e.shiftKey,meta:e.metaKey,repeat:e.repeat,target:e.target.id || e.target.tagName,prevented:e.defaultPrevented});
  events = events.slice(-600);
  $('log').textContent = events.map(x => JSON.stringify(x)).join('\n');
  $('log').scrollTop = $('log').scrollHeight;
}
for (const type of ['keydown','keyup']) document.addEventListener(type, e => {
  if ($('mode').value === 'capture') {
    if (type === 'keydown' && isPrefix(e, $('prefix').value, $('custom').value)) {
      e.preventDefault(); e.stopImmediatePropagation(); start();
    } else if (active) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (type === 'keydown') {
        if (e.key === 'Enter') {
          const scan = {...classify(buffer, $('expected').value.trim()), at:new Date().toISOString()};
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
for (const id of ['mode','prefix','custom']) $(id).addEventListener('change', () => reset('Settings changed. Ready.'));
$('probe').onclick = () => $('clicks').textContent = `Activations: ${++activations}`;
$('interrupt').onclick = start;
$('clear').onclick = () => {reset('Cleared.'); events=[]; scans=[]; $('log').textContent=''; $('results').textContent='No completed scans.';};
$('download').onclick = () => {
  const blob = new Blob([JSON.stringify({userAgent:navigator.userAgent,mode:$('mode').value,prefix:$('prefix').value,custom:$('custom').value,expected:$('expected').value,activations,scans,events},null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href=url; a.download='scanner-diagnostics.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
};
