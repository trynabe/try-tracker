import test from 'node:test';
import assert from 'node:assert/strict';
import {desktopAccentInk} from '../src/desktopTheme.js';
import {accentPresets} from '../src/accent.js';

const luminance=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
test('desktop accent text stays readable for presets and extreme custom colors in both themes',()=>{
 for(const theme of ['light','dark'])for(const accent of [...Object.values(accentPresets),'#ffffff','#000000','#ffff00','#00ffff','#ff00ff','#111318']){
  const ink=luminance(desktopAccentInk(accent,theme));
  const background=luminance(theme==='dark'?'#1b1e25':'#ffffff');
  assert.ok((Math.max(ink,background)+.05)/(Math.min(ink,background)+.05)>=4.5,`${accent} on ${theme}`);
 }
});
test('readable desktop accents keep their chosen color and invalid input has a safe fallback',()=>{
 assert.equal(desktopAccentInk('#6255e7','light'),'#6255e7');
 assert.equal(desktopAccentInk('#ffffff','dark'),'#ffffff');
 assert.equal(desktopAccentInk('invalid','dark'),desktopAccentInk('#6255e7','dark'));
});
