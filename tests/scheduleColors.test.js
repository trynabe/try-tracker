import test from 'node:test';
import assert from 'node:assert/strict';
import {categoryColor,normalizeScheduleColor,scheduleColor} from '../src/scheduleColors.js';
import {normalizeBackup} from '../src/domain.js';

test('schedule colors survive backup export/import and each activity keeps its own color',()=>{
 const blocks=[{id:'a',title:'Work',category:'Work',start:'09:00',end:'10:00',day:1,color:'#2563EB'},{id:'b',title:'Meeting',category:'Work',start:'11:00',end:'12:00',day:1,color:'#dc2626'}];
 const data=normalizeBackup(JSON.parse(JSON.stringify({version:'2.0',data:{timeblocks:blocks}})));
 assert.deepEqual(data.timeblocks.map(scheduleColor),['#2563eb','#dc2626']);
});

test('old activities and invalid imported colors retain their automatic category color',()=>{
 for(const color of [undefined,'','red','url(https://example.com)','#fff','#00000000',{},null]){
  const data=normalizeBackup({timeblocks:[{id:'a',title:'Work',category:'Work',start:'09:00',end:'10:00',day:1,color}]});
  assert.equal(data.timeblocks[0].color,'');
  assert.equal(scheduleColor(data.timeblocks[0]),categoryColor('Work'));
 }
 assert.equal(normalizeScheduleColor('#123AbC'),'#123abc');
});
