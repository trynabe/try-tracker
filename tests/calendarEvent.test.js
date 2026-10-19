import test from 'node:test';
import assert from 'node:assert/strict';
import {createCalendarEvent,updateCalendarEvent,calendarEventDraft} from '../src/calendarEvent.js';
import {eventsForDate} from '../src/calendarModel.js';
import {mergeCalendarEvents,parseCalendarFile} from '../src/calendarImport.js';
import {normalizeBackup} from '../src/domain.js';
const data=events=>({profile:[{id:'profile',calendarEvents:events}]});

test('manual overnight events display on both dates and survive backup restore',()=>{
 const event=createCalendarEvent({title:' Night study ',date:'2026-10-19',endDate:'2026-10-20',startTime:'23:00',endTime:'01:00',location:' Library '},'night');
 assert.equal(event.title,'Night study');assert.equal(event.location,'Library');
 const restored=normalizeBackup(data([event]));
 assert.equal(restored.profile[0].calendarEvents[0].origin,'manual');
 assert.deepEqual(eventsForDate(restored,'2026-10-19').map(e=>[e.start,e.end]),[['23:00','24:00']]);
 assert.deepEqual(eventsForDate(restored,'2026-10-20').map(e=>[e.start,e.end,e.continuation]),[['00:00','01:00',true]]);
 assert.deepEqual(eventsForDate(restored,'2026-10-21'),[]);
});
test('all-day ranges include the chosen end date across month and year boundaries',()=>{
 const event=createCalendarEvent({title:'Holiday',date:'2026-12-31',endDate:'2027-01-02',allDay:true},'holiday');
 assert.equal(event.endDate,'2027-01-03');
 for(const day of ['2026-12-31','2027-01-01','2027-01-02'])assert.equal(eventsForDate(data([event]),day).length,1);
 assert.equal(eventsForDate(data([event]),'2027-01-03').length,0);
 const single=createCalendarEvent({title:'One day',date:'2024-02-29',allDay:true},'leap');
 assert.equal(single.endDate,'2024-03-01');
});
test('manual creation rejects blank names, invalid dates and reversed or equal times',()=>{
 const base={title:'Meeting',date:'2026-10-19'};
 for(const change of [{title:'  '},{date:'2026-02-30'},{date:''},{endDate:'2026-10-18'},{startTime:'10:00',endTime:'09:00'},{startTime:'10:00',endTime:'10:00'},{startTime:'24:00'}])assert.throws(()=>createCalendarEvent({...base,...change}));
});
test('reimporting an ICS file preserves manually created events',()=>{
 const manual=createCalendarEvent({title:'Personal',date:'2026-10-19'},'personal');
 const text=['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT','UID:course','SUMMARY:Class','DTSTART;VALUE=DATE:20261019','END:VEVENT','END:VCALENDAR'].join('\r\n');
 const parsed=parseCalendarFile(text,'course.ics',{from:'2026-10-01',to:'2026-11-01'});
 const merged=mergeCalendarEvents([manual],parsed);
 assert.equal(merged.events.length,2);assert.ok(merged.events.some(e=>e.key===manual.key));
 assert.equal(mergeCalendarEvents(merged.events,parsed).events.length,2);
});

test('editing an all-day event preloads inclusive dates and replaces it without duplication',()=>{
 const original=createCalendarEvent({title:'Trip',date:'2026-12-31',endDate:'2027-01-02',allDay:true},'edit');
 const draft=calendarEventDraft(original);
 assert.equal(draft.endDate,'2027-01-02');
 const updated=updateCalendarEvent(original,{...draft,title:'Updated trip',endDate:'2027-01-03'});
 assert.equal(updated.key,original.key);assert.equal(updated.uid,original.uid);
 assert.equal(updated.endDate,'2027-01-04');
 const result=mergeCalendarEvents([original],{events:[updated],series:[]});
 assert.equal(result.updated,1);assert.equal(result.added,0);assert.equal(result.events.length,1);
 assert.equal(eventsForDate(data(result.events),'2027-01-03').length,1);
 assert.equal(original.title,'Trip');
});
test('editing imported event text preserves source, recurrence identity, category and second precision',()=>{
 const text=['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT','UID:original-class','SUMMARY:Class','CATEGORIES:Study','DTSTART:20261019T090030','DTEND:20261019T100045','END:VEVENT','END:VCALENDAR'].join('\r\n');
 const original=parseCalendarFile(text,'class.ics',{from:'2026-10-01',to:'2026-11-01'}).events[0];
 const updated=updateCalendarEvent(original,{...calendarEventDraft(original),title:'Updated class',location:'Room 2'});
 for(const field of ['key','uid','occurrence','category','source','start','end'])assert.equal(updated[field],original[field]);
 assert.equal(updated.title,'Updated class');assert.equal(updated.location,'Room 2');
});
