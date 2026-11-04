import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBackup} from '../src/domain.js';
import {glassSurfaceStyles} from '../src/glassPreferences.js';

test('glass preference survives a JSON backup with theme and custom accent',()=>{
 for(const glassmorphism of [true,false])for(const glassTransparency of [0,55,90,100,150,200]){
  const profile={id:'profile',glassmorphism,glassTransparency,theme:'dark',accent:'custom',customAccent:'#53b7ae'};
  const restored=normalizeBackup(JSON.parse(JSON.stringify({version:'2.8',data:{profile:[profile]}}))).profile[0];
  assert.equal(restored.glassmorphism,glassmorphism);
  assert.equal(restored.glassTransparency,glassTransparency);
  assert.equal(restored.theme,'dark');
  assert.equal(restored.customAccent,'#53b7ae');
 }
});

test('existing profiles and legacy backups keep glass disabled until selected',()=>{
 assert.equal(normalizeBackup({profile:[{id:'profile',theme:'light'}]}).profile[0].glassmorphism,false);
 assert.equal(normalizeBackup({version:'1.0',username:'Explorer'}).profile[0].glassmorphism,false);
 assert.equal(normalizeBackup({profile:[{id:'profile'}]}).profile[0].glassTransparency,55);
});

test('imported transparency is bounded and rounded to slider steps',()=>{
 for(const [input,expected] of [[-200,0],[500,200],[200,200],[43.7,44],[199.6,200],[0,0],[90,90]]){
  const restored=normalizeBackup({profile:[{id:'profile',glassTransparency:input}]}).profile[0];
  assert.equal(restored.glassTransparency,expected);
 }
});

test('existing transparency levels retain their surface opacity and reflections',()=>{
 for(const [value,opacity] of [[0,'100%'],[55,'45%'],[90,'10%']]){
  const styles=glassSurfaceStyles(value);
  assert.equal(styles['--glass-surface-opacity'],opacity);
  assert.equal(styles['--glass-reflection-opacity'],'100%');
  assert.equal(styles['--glass-blur-multiplier'],'1');
 }
});

test('extra clarity reduces reflections and frost without negative surface opacity',()=>{
 const levels=[100,150,200].map(glassSurfaceStyles);
 assert.ok(levels.every(styles=>styles['--glass-surface-opacity']==='0%'));
 for(const key of ['--glass-reflection-opacity','--glass-blur-multiplier']){
  const values=levels.map(styles=>parseFloat(styles[key]));
  assert.ok(values[0]>values[1]&&values[1]>values[2]&&values[2]>0);
 }
 for(const value of [-100,0,55,90,100,150,200,999,NaN]){
  const opacity=parseFloat(glassSurfaceStyles(value)['--glass-surface-opacity']);
  assert.ok(Number.isFinite(opacity)&&opacity>=0&&opacity<=100);
 }
});

test('malformed transparency values use the default without enabling glass',()=>{
 for(const glassTransparency of ['90',null,true,{},[],NaN,Infinity]){
  const restored=normalizeBackup({profile:[{id:'profile',glassTransparency}]}).profile[0];
  assert.equal(restored.glassTransparency,55);
  assert.equal(restored.glassmorphism,false);
 }
});

test('malformed glass preferences cannot accidentally enable transparency',()=>{
 for(const glassmorphism of ['false','true',1,0,null,{},[]]){
  const restored=normalizeBackup({profile:[{id:'profile',glassmorphism}]}).profile[0];
  assert.equal(restored.glassmorphism,false);
 }
});
