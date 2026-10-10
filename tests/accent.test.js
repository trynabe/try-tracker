import test from 'node:test';
import assert from 'node:assert/strict';
import {accentPresets,accentSettings,accentColor,accentContrast,safeAccent} from '../src/accent.js';
import {normalizeBackup} from '../src/domain.js';

test('all nine solid presets survive backup import',()=>{
 assert.equal(Object.keys(accentPresets).length,9);
 for(const [accent,color] of Object.entries(accentPresets)){
  const profile=normalizeBackup({data:{profile:[{id:'profile',accent}]}}).profile[0];
  assert.equal(profile.accent,accent);assert.equal(accentColor(profile),color);
 }
});
test('custom colors and the last chosen custom value survive JSON backups',()=>{
 const original={id:'profile',accent:'custom',customAccent:'#Ab12CD'};
 const profile=normalizeBackup(JSON.parse(JSON.stringify({data:{profile:[original]}}))).profile[0];
 assert.equal(profile.accent,'custom');assert.equal(profile.customAccent,'#ab12cd');
 assert.equal(accentColor(profile),'#ab12cd');
 assert.equal(accentSettings({...profile,accent:'blue'}).customAccent,'#ab12cd');
});
test('malformed custom colors fall back safely and legacy rainbow retains its actual color',()=>{
 for(const value of ['red','#abc','url(https://example.com)','#ffffff;display:none',null]){
  assert.equal(safeAccent(value),'');assert.equal(accentSettings({accent:'custom',customAccent:value}).accent,'violet');
 }
 const profile=normalizeBackup({data:{profile:[{id:'profile',accent:'rainbow'}]}}).profile[0];
 assert.equal(profile.accent,'custom');assert.equal(accentColor(profile),'#9952ce');
});
test('custom accents select readable foregrounds for bright and dark colors',()=>{
 assert.equal(accentContrast('#ffffff'),'#111827');assert.equal(accentContrast('#ffff00'),'#111827');
 assert.equal(accentContrast('#000000'),'#ffffff');assert.equal(accentContrast('#2563eb'),'#ffffff');
});
