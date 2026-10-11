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
const calendar=(...events)=>['BEGIN:VCALENDAR','VERSION:2.0',...events,'END:VCALENDAR'].join('\r\n');
const event=(uid,...fields)=>['BEGIN:VEVENT','UID:'+uid,...fields,'END:VEVENT'].join('\r\n');
const parse=text=>parseCalendarFile(text,'course.ics',{from:'2026-10-01',to:'2026-11-30'}).events;

test('calendar is empty without ICS and never reads tasks or weekly Schedule records',()=>{
 const data={profile:[{calendarEvents:[]}],get tasks(){throw Error('Tasks must stay separate');},get timeblocks(){throw Error('Schedule must stay separate');}};
 assert.deepEqual(eventsForDate(data,'2026-10-16'),[]);
 data.profile[0].calendarEvents=parse(calendar(event('course','SUMMARY:691_ITDS294','DTSTART;VALUE=DATE:20261016')));
 assert.equal(eventsForDate(data,'2026-10-16')[0].kind,'imported');
 assert.deepEqual(eventsForDate(data,'2026-10-23'),[]);
});

test('even matching imported courses never create weekly lectures, labs or task entries',()=>{
 const data={tasks:[{id:'task',text:'Course deadline',dueDate:'2026-10-16'}],timeblocks:['Electric Commerce Lectures','Electric Commerce Lab','ITDS294','Deep work','Any other class'].map((title,index)=>({id:String(index),title,day:5,start:'09:00',end:'10:00'})),profile:[{calendarEvents:parse(calendar(event('course','SUMMARY:691_ITDS294','DTSTART;VALUE=DATE:20261016')))}]};
 const before=JSON.stringify(data);
 const displayed=eventsForDate(data,'2026-10-16');
 assert.equal(displayed.length,1);assert.equal(displayed[0].kind,'imported');
 assert.equal(displayed[0].item.title,'691_ITDS294');
 for(const day of ['2026-10-09','2026-10-23','2026-10-30'])assert.deepEqual(eventsForDate(data,day),[]);
 assert.equal(JSON.stringify(data),before);
 data.profile[0].calendarEvents=[];
 assert.deepEqual(eventsForDate(data,'2026-10-16'),[]);
 assert.equal(data.timeblocks.length,5);assert.equal(data.tasks.length,1);
});

test('calendar respects ICS all-day exclusive ends, overnight spans and midnight endings',()=>{
 const data={profile:[{calendarEvents:parse(calendar(event('trip','SUMMARY:Trip','DTSTART;VALUE=DATE:20261030','DTEND;VALUE=DATE:20261101'),event('night','SUMMARY:Night','DTSTART:20261031T230000','DTEND:20261101T010000'),event('midnight','SUMMARY:Ends at midnight','DTSTART:20261031T220000','DTEND:20261101T000000')))}]};
 assert.deepEqual(eventsForDate(data,'2026-10-30').map(e=>e.item.uid),['trip']);
 const first=eventsForDate(data,'2026-10-31');
 assert.deepEqual(first.map(e=>e.item.uid),['trip','midnight','night']);
 assert.deepEqual([first[2].start,first[2].end],['23:00','24:00']);
 const next=eventsForDate(data,'2026-11-01');
 assert.equal(next.length,1);
 assert.deepEqual([next[0].item.uid,next[0].start,next[0].end,next[0].continuation],['night','00:00','01:00',true]);
 assert.deepEqual(eventsForDate(data,'2026-11-02'),[]);
});

test('recurrence occurs only on ICS dates, respecting count, exclusions, moved events and cancellation',()=>{
 const master=event('weekly','SUMMARY:691_ITDS241','DTSTART:20261005T090000','DTEND:20261005T100000','RRULE:FREQ=WEEKLY;COUNT=4','EXDATE:20261012T090000');
 const moved=event('weekly','SUMMARY:Make-up ITDS241','RECURRENCE-ID:20261019T090000','DTSTART:20261020T110000','DTEND:20261020T120000');
 const cancelled=event('cancelled','SUMMARY:Cancelled ITDS294','STATUS:CANCELLED','DTSTART;VALUE=DATE:20261016');
 const data={profile:[{calendarEvents:parse(calendar(master,moved,cancelled))}],timeblocks:[{id:'weekly',title:'Website Technology Lectures',day:1,start:'09:00',end:'10:00'}]};
 assert.equal(eventsForDate(data,'2026-10-05').length,1);
 for(const day of ['2026-10-12','2026-10-19','2026-11-02'])assert.deepEqual(eventsForDate(data,day),[]);
 const makeUp=eventsForDate(data,'2026-10-20');
 assert.equal(makeUp.length,1);assert.equal(makeUp[0].start,'11:00');
 assert.equal(eventsForDate(data,'2026-10-26').length,1);
 assert.equal(eventsForDate(data,'2026-10-16')[0].item.status,'CANCELLED');
 assert.deepEqual(eventsForDate(data,'2026-10-23'),[]);
});

test('calendar shortcut survives backup import in its selected position',()=>{
 const data=normalizeBackup({profile:[{id:'profile',name:'Test',bottomTabs:['calendar','tasks','schedule']}]});
 assert.deepEqual(data.profile[0].bottomTabs,['calendar','tasks','schedule']);
});
