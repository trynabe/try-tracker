import test from 'node:test';
import assert from 'node:assert/strict';
import {monthCells,shiftMonth,eventsForDate} from '../src/calendarModel.js';
import {normalizeBackup} from '../src/domain.js';
import {parseCalendarFile} from '../src/calendarImport.js';

test('months fill adjacent dates into only the Monday-first weeks needed, including leap day',()=>{
 const cells=monthCells('2024-02-15');
 assert.equal(cells.length,35);
 assert.deepEqual(cells.slice(0,4),['2024-01-29','2024-01-30','2024-01-31','2024-02-01']);
 assert.equal(cells.filter(key=>key.startsWith('2024-02-')).at(-1),'2024-02-29');
 assert.ok(cells.includes('2024-02-29'));
 assert.equal(new Set(cells).size,35);
 assert.equal(cells.filter(key=>key.startsWith('2024-02-')).length,29);
 assert.deepEqual(cells.slice(-3),['2024-03-01','2024-03-02','2024-03-03']);
 const october=monthCells('2026-10-14');
 assert.equal(october.length,35);
 assert.equal(october.filter(key=>key.startsWith('2026-10-')).length,31);
 assert.equal(october[0],'2026-09-28');
 assert.equal(october.at(-1),'2026-11-01');
 const fourWeeks=monthCells('2021-02-01');
 assert.equal(fourWeeks.length,28);
 assert.ok(fourWeeks.every(Boolean));
 const sixWeeks=monthCells('2026-03-01');
 assert.equal(sixWeeks.length,42);
 assert.equal(sixWeeks[6],'2026-03-01');
 assert.equal(sixWeeks.filter(key=>key.startsWith('2026-03-')).at(-1),'2026-03-31');
 assert.equal(sixWeeks.at(-1),'2026-04-05');
});
test('month navigation clamps late dates without skipping February and crosses years',()=>{
 assert.equal(shiftMonth('2026-01-31',1),'2026-02-28');
 assert.equal(shiftMonth('2024-03-31',-1),'2024-02-29');
 assert.equal(shiftMonth('2026-12-15',1),'2027-01-15');
});
test('calendar combines due tasks and recurring blocks, excludes trash and undated tasks',()=>{
 const data={tasks:[{id:'a',text:'Due task',dueDate:'2026-10-11'},{id:'b',text:'Undated'},{id:'c',text:'Deleted',dueDate:'2026-10-11',deletedAt:1}],timeblocks:[{id:'s',title:'Study',day:0,start:'09:00',end:'10:00'},{id:'d',title:'Deleted',day:0,start:'11:00',end:'12:00',deletedAt:1}]};
 assert.deepEqual(eventsForDate(data,'2026-10-11').map(event=>event.title),['Due task','Study']);
 assert.deepEqual(eventsForDate(data,'2026-10-12'),[]);
 assert.equal(eventsForDate(data,'2026-10-18')[0].title,'Study');
});
test('overnight blocks carry across Sunday and month boundaries without phantom history',()=>{
 const data={timeblocks:[{id:'night',title:'Night',day:6,start:'23:00',end:'01:00',createdAt:new Date('2026-10-31T12:00:00').getTime()}]};
 const first=eventsForDate(data,'2026-10-31')[0],next=eventsForDate(data,'2026-11-01')[0];
 assert.deepEqual([first.start,first.end],['23:00','24:00']);
 assert.deepEqual([next.start,next.end,next.continuation],['00:00','01:00',true]);
 assert.deepEqual(eventsForDate(data,'2026-10-25'),[]);
});
test('completed tasks remain visible and midnight endings do not create next-day events',()=>{
 const data={tasks:[{id:'t',text:'Done',done:true,dueDate:'2026-10-31'}],timeblocks:[{id:'night',title:'Night',day:6,start:'23:00',end:'00:00'}]};
 assert.equal(eventsForDate(data,'2026-10-31')[0].done,true);
 assert.deepEqual(eventsForDate(data,'2026-11-01'),[]);
});
test('calendar shortcut survives backup import in its selected position',()=>{
 const data=normalizeBackup({profile:[{id:'profile',name:'Test',bottomTabs:['calendar','tasks','schedule']}]});
 assert.deepEqual(data.profile[0].bottomTabs,['calendar','tasks','schedule']);
});

test('weekly course schedules require a matching saved ICS import, while personal tasks and activities remain visible',()=>{
 const titles=['Website Technology Lectures','Website Technology Lab','Software Engineering Lectures','Software Engineering Lab','Computer Architecture Lectures','Computer Systems Lab','Computer Network Lectures','Computer Network Lab','ITLG201','Fundamentals of Electronic Commerce Systems','Electric Commerce Lectures','Electric Commerce Lab'];
 const data={tasks:[{id:'task',text:'Prepare for ITDS211',dueDate:'2026-10-12'}],timeblocks:titles.map((title,index)=>({id:'class-'+index,title,day:1,start:'09:00',end:'10:00'})).concat([{id:'work',title:'Deep work',day:1,start:'10:00',end:'11:00'},{id:'reading',title:'Read a book about software engineering',day:1,start:'11:00',end:'12:00'}]),profile:[{calendarEvents:[]}]};
 const before=JSON.stringify(data.timeblocks);
 assert.deepEqual(eventsForDate(data,'2026-10-12').map(event=>event.title),['Prepare for ITDS211','Deep work','Read a book about software engineering']);
 const file=['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT','UID:course@school','SUMMARY:691_ITDS241','DTSTART;VALUE=DATE:20261013','END:VEVENT','END:VCALENDAR'].join('\r\n');
 data.profile[0].calendarEvents=parseCalendarFile(file,'course.ics',{from:'2026-10-01',to:'2026-10-31'}).events;
 assert.deepEqual(eventsForDate(data,'2026-10-12').map(event=>event.title),['Prepare for ITDS211','Website Technology Lectures','Deep work','Read a book about software engineering']);
 assert.equal(JSON.stringify(data.timeblocks),before);
 data.profile[0].calendarEvents=[];
 assert.ok(!eventsForDate(data,'2026-10-12').some(event=>titles.includes(event.title)));
});
test('unimported course blocks do not leak overnight continuation into the next day',()=>{
 const data={timeblocks:[{id:'class',title:'ITDS211',day:1,start:'23:00',end:'01:00'}]};
 assert.deepEqual(eventsForDate(data,'2026-10-12'),[]);
 assert.deepEqual(eventsForDate(data,'2026-10-13'),[]);
});

test('Electric Commerce lecture and lab stay hidden until ITDS294 is imported, including later weeks',()=>{
 const data={timeblocks:[{id:'lecture',title:'Electric Commerce Lectures',day:5,start:'09:00',end:'10:00'},{id:'lab',title:'Electric Commerce Lab',day:5,start:'10:00',end:'11:00'}],profile:[{calendarEvents:[]}]};
 const before=JSON.stringify(data.timeblocks);
 for(const day of ['2026-10-16','2026-10-23','2026-10-30'])assert.deepEqual(eventsForDate(data,day),[]);
 const file=code=>['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT','UID:commerce@school','SUMMARY:691_'+code,'DTSTART;VALUE=DATE:20261017','END:VEVENT','END:VCALENDAR'].join('\r\n');
 const parse=code=>parseCalendarFile(file(code),'course.ics',{from:'2026-10-01',to:'2026-10-31'}).events;
 data.profile[0].calendarEvents=parse('ITDS241');
 assert.deepEqual(eventsForDate(data,'2026-10-16'),[]);
 data.profile[0].calendarEvents=parse('ITDS294');
 assert.deepEqual(eventsForDate(data,'2026-10-16').map(event=>event.title),['Electric Commerce Lectures','Electric Commerce Lab']);
 assert.equal(JSON.stringify(data.timeblocks),before);
 data.profile[0].calendarEvents=[];
 assert.deepEqual(eventsForDate(data,'2026-10-16'),[]);
});
