import {test} from 'node:test';
import assert from 'node:assert/strict';
import {classify,isPrefix} from './parser.mjs';
test('preserves supplemental zeros and distinguishes base UPC',()=>{
 assert.equal(classify('75960621560700111').value,'75960621560700111');
 assert.equal(classify('75960621560700111').kind,'extended UPC');
 assert.equal(classify('759606215607').kind,'base UPC');
 for(const x of ['7596062156070011','759606215607001111','7596062156070011x','759606215607\n']) assert.equal(classify(x).kind,'invalid');
});
test('detects prefix mapping without treating normal b as a scan',()=>{
 const e={key:'b',ctrlKey:false,altKey:false,metaKey:false};
 assert.equal(isPrefix(e,'ctrl-b'),false);
 assert.equal(isPrefix({...e,ctrlKey:true},'ctrl-b'),true);
 assert.equal(isPrefix({...e,key:'\u0002'},'stx'),true);
 assert.equal(isPrefix({...e,key:'F9'},'f9'),true);
});
