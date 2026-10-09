import test from 'node:test';import assert from 'node:assert/strict';import {dateKey,shiftDate,streak,splitSession,normalizeBackup,emptyData,statistics,minutes,orderHabits,updateRecordList,reconcileSubtasks,timerElapsedSeconds} from '../src/domain.js';
test('dates use the local calendar, including leap day',()=>{const d=new Date(2024,1,29,0,5);assert.equal(dateKey(d),'2024-02-29');assert.equal(shiftDate('2024-02-29',1),'2024-03-01');});
test('streak skips non-scheduled days and preserves yesterday streak before today completion',()=>{const h={createdAt:new Date(2026,9,1).getTime(),days:[4,6,0],target:2,logs:[{date:'2026-10-01',value:2},{date:'2026-10-03',value:2}]};assert.deepEqual(streak(h,'2026-10-04'),{current:2,best:2});h.logs.push({date:'2026-10-04',value:2});assert.deepEqual(streak(h,'2026-10-04'),{current:3,best:3});});
test('sessions crossing midnight are split between actual local dates',()=>{const start=new Date(2026,9,3,23,55).getTime();const end=new Date(2026,9,4,0,5).getTime();const list=splitSession({id:'timer',subject:'Study',startedAt:start,mode:'stopwatch'},end);assert.equal(list.length,2);assert.deepEqual(list.map(x=>[x.date,x.durationSeconds]),[['2026-10-03',300],['2026-10-04',300]]);assert.equal(list[0].id,'timer-0');});
test('Pomodoro caps saved duration after background suspension',()=>{const start=new Date(2026,9,4,9).getTime();const list=splitSession({id:'t',subject:'Study',startedAt:start,mode:'pomodoro',targetMinutes:25},start+60*60000);assert.equal(list.reduce((n,s)=>n+s.durationSeconds,0),1500);});
test('legacy backup migrates all domains without retaining password hashes',()=>{const raw={version:'1.0',username:'name',userRecord:{passwordHash:'secret',createdAt:10},habits:[{id:'h',name:'Read',logs:[{date:'2026-10-01',done:true}]}],tasks:[{id:'t',text:'Work',urgent:true}],timeblocks:[{id:'b',title:'Study',start:'23:00',end:'01:00',day:'monday',type:'study',timestamp:10}],notes:[],subjects:[],focusSessions:[{id:'f',subject:'Study',durationMinutes:25,timestamp:new Date(2026,9,4).getTime()}]};const data=normalizeBackup(raw);assert.equal(data.habits[0].logs[0].value,1);assert.equal(data.tasks[0].priority,'high');assert.equal(data.timeblocks[0].day,1);assert.equal(data.focusSessions[0].durationSeconds,1500);assert.equal(JSON.stringify(data).includes('passwordHash'),false);});
test('malformed backups and duplicate IDs are rejected',()=>{assert.throws(()=>normalizeBackup({habits:'no'}));assert.throws(()=>normalizeBackup({habits:[{id:'h',name:'A',logs:[]},{id:'h',name:'B',logs:[]}]}));assert.throws(()=>normalizeBackup({timeblocks:[{id:'b',title:'Bad',start:'99:00',end:'01:00',day:1}]}));});
test('analytics counts completed older tasks and includes recurring plans created more than 7 days ago',()=>{const data=emptyData();data.tasks=[{id:'a',createdAt:new Date(2026,8,1).getTime(),done:true,completedAt:new Date(2026,9,4).getTime()}];data.timeblocks=[{id:'b',createdAt:new Date(2026,8,1).getTime(),day:0,start:'09:00',end:'10:00',category:'Work'}];data.focusSessions=[{id:'f',subject:'Work',date:'2026-10-04',durationSeconds:1500}];const result=statistics(data,7,'2026-10-04');assert.equal(result.tasksDone,1);assert.equal(result.planned.Work,60);assert.equal(result.actual.Work,25);assert.equal(minutes('23:00','01:00'),120);assert.ok(result.score<=100);});

test('daily budgets split overnight schedules into the correct weekday',async()=>{const {scheduledMinutes}=await import('../src/domain.js');const b={day:6,start:'23:00',end:'01:00'};assert.equal(scheduledMinutes(b,6),60);assert.equal(scheduledMinutes(b,0),60);assert.equal(scheduledMinutes(b,1),0);});

test('backup keeps five unique valid mobile tabs in the selected order',()=>{const result=normalizeBackup({version:'2.0',data:{profile:[{id:'profile',name:'Test',bottomTabs:['notes','focus','tasks','schedule','insights','notes','invalid','today']}]}});assert.deepEqual(result.profile[0].bottomTabs,['notes','focus','tasks','schedule','insights']);});

test('count habits retain position through partial updates and newly completed habits go last',()=>{const day='2026-10-04';const habits=[{id:'check',target:1,createdAt:3,logs:[]},{id:'water',target:3,createdAt:2,logs:[]},{id:'read',target:4,createdAt:1,logs:[]},{id:'done',target:1,createdAt:4,logs:[{date:day,value:1,completedAt:10}]}];const ids=list=>orderHabits(list,day).map(h=>h.id);assert.deepEqual(ids(habits),['read','water','check','done']);const partial=updateRecordList(habits,{...habits[2],logs:[{date:day,value:1}]});assert.deepEqual(ids(partial),ids(habits));const complete=updateRecordList(partial,{...habits[2],logs:[{date:day,value:4,completedAt:20}]});assert.deepEqual(ids(complete),['water','check','done','read']);const reset=updateRecordList(complete,{...habits[2],logs:[{date:day,value:0}]});assert.deepEqual(ids(reset),ids(habits));assert.deepEqual(habits[2].logs,[]);assert.deepEqual(ids(complete.map(h=>({...h,logs:[]}))),['read','water','check','done']);});
test('record updates keep their original position; additions and deletions work',()=>{const list=[{id:'a',value:0},{id:'b',value:0}];assert.deepEqual(updateRecordList(list,{id:'a',value:1}).map(x=>x.id),['a','b']);assert.equal(list[0].value,0);assert.deepEqual(updateRecordList(list,{id:'c'}).map(x=>x.id),['a','b','c']);assert.deepEqual(updateRecordList(list,{id:'a'},true).map(x=>x.id),['b']);});
test('backup retains per-day habit completion order',()=>{const result=normalizeBackup({habits:[{id:'h',name:'Read',target:2,logs:[{date:'2026-10-04',value:2,completedAt:123}]}]});assert.equal(result.habits[0].logs[0].completedAt,123);});

test('duplicate subtask names retain independent IDs and completion state after editing',()=>{const previous=[{id:'a',text:'Repeat',done:true},{id:'b',text:'Repeat',done:false}];const list=reconcileSubtasks('Repeat\nRepeat\nRepeat',previous);assert.equal(new Set(list.map(s=>s.id)).size,3);assert.deepEqual(list.map(s=>s.done),[true,false,false]);assert.deepEqual(list.slice(0,2).map(s=>s.id),['a','b']);assert.deepEqual(previous.map(s=>s.done),[true,false]);});
test('editing repairs existing duplicate subtask IDs while preserving completion state',()=>{const list=reconcileSubtasks('Repeat\nRepeat',[{id:'a',text:'Repeat',done:true},{id:'a',text:'Repeat',done:false}]);assert.notEqual(list[0].id,list[1].id);assert.deepEqual(list.map(s=>s.done),[true,false]);});

test('timer retains saved elapsed seconds when resumed before the next clock tick',()=>{const timer={startedAt:10000,elapsedBefore:52,paused:false};assert.equal(timerElapsedSeconds(timer,9500),52);assert.equal(timerElapsedSeconds(timer,12000),54);assert.equal(timerElapsedSeconds({...timer,paused:true},20000),52);assert.equal(timerElapsedSeconds(null,20000),0);});

test('task history uses completion dates, sorts newest first and respects the selected period',()=>{
 const data=emptyData();
 const timestamp=date=>new Date(date+'T12:00:00').getTime();
 data.tasks=[
  {id:'older-created',done:true,createdAt:timestamp('2026-08-01'),completedAt:timestamp('2026-10-09')},
  {id:'recent-created',done:true,createdAt:timestamp('2026-10-09'),completedAt:timestamp('2026-10-01')},
  {id:'latest',done:true,createdAt:timestamp('2026-10-08'),completedAt:timestamp('2026-10-10')},
  {id:'legacy',done:true,createdAt:timestamp('2026-10-08')},
  {id:'open',done:false,createdAt:timestamp('2026-10-10')},
  {id:'future',done:true,createdAt:timestamp('2026-10-09'),completedAt:timestamp('2026-10-11')}
 ];
 const order=data.tasks.map(task=>task.id);
 const week=statistics(data,7,'2026-10-10');
 assert.deepEqual(week.completedTasks.map(task=>task.id),['latest','older-created','legacy']);
 assert.equal(week.tasksDone,week.completedTasks.length);
 assert.deepEqual(statistics(data,30,'2026-10-10').completedTasks.map(task=>task.id),['latest','older-created','legacy','recent-created']);
 assert.deepEqual(data.tasks.map(task=>task.id),order);
});
