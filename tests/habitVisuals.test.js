import test from 'node:test';
import assert from 'node:assert/strict';
import {habitHistory,habitColor} from '../src/habitVisuals.js';
import {normalizeBackup,weekday} from '../src/domain.js';

const habit={id:'h',name:'Read',emoji:'book',target:2,createdAt:new Date('2026-10-01T12:00:00').getTime(),days:[1,3,5],logs:[{date:'2026-10-02',value:2},{date:'2026-10-05',value:1}]};
test('history uses Monday-first weekly columns and distinguishes partial completion',()=>{
 const cells=habitHistory(habit,'2026-10-09');
 assert.equal(cells.length,140);assert.equal(weekday(cells[0].date),1);
 assert.equal(cells.find(c=>c.date==='2026-10-02').level,'done');
 assert.equal(cells.find(c=>c.date==='2026-10-05').level,'partial');
 assert.equal(cells.find(c=>c.date==='2026-10-07').level,'empty');
});
test('days before creation, unscheduled days and future cells cannot be selected',()=>{
 const cells=habitHistory(habit,'2026-10-09');
 for(const date of ['2026-09-30','2026-10-04','2026-10-10'])assert.equal(cells.find(c=>c.date===date).available,false);
 assert.equal(cells.find(c=>c.date==='2026-10-09').available,true);
});
test('habit colors survive backup import and old habits have stable fallback colors',()=>{
 const restored=normalizeBackup({habits:[{...habit,color:'#43D6AB'}]}).habits[0];
 assert.equal(habitColor(restored),'#43d6ab');
 assert.equal(habitColor(habit),habitColor({...habit}));
 assert.equal(habitColor({...habit,emoji:'📚'}),habitColor(habit));
 assert.equal(habitColor({...habit,color:'url(example.com)'}),habitColor(habit));
});
