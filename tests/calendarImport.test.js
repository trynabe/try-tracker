import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCalendarFile,mergeCalendarEvents,importedEventsForDate,validateCalendarEvents} from '../src/calendarImport.js';
import {normalizeBackup} from '../src/domain.js';
import {eventsForDate} from '../src/calendarModel.js';

const range={from:'2026-10-01',to:'2026-11-30'};
const calendar=(...events)=>'BEGIN:VCALENDAR\r\nVERSION:2.0\r\n'+events.join('\r\n')+'\r\nEND:VCALENDAR';
const event=(uid,lines)=>'BEGIN:VEVENT\r\nUID:'+uid+'\r\n'+lines.join('\r\n')+'\r\nEND:VEVENT';
const parse=value=>parseCalendarFile(value,'classes.ics',range);
const meeting=event('class-1',['SUMMARY:Lecture','DESCRIPTION:Room : IT304\\nBring notes','DTSTART:20261008T020000Z','DTEND:20261008T040000Z']);

test('Moodle-style UTC times, escaped descriptions and folded titles import as local events',()=>{
 const result=parse(calendar(meeting.replace('SUMMARY:Lecture','SUMMARY:Lecture in\r\n  IT304')));
 assert.equal(result.events[0].title,'Lecture in IT304');
 assert.equal(result.events[0].description,'Room : IT304\nBring notes');
 assert.equal(result.events[0].start,Date.parse('2026-10-08T02:00:00Z'));
 const displayed=importedEventsForDate(result.events,'2026-10-08')[0];
 const localTime=new Date('2026-10-08T02:00:00Z').toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
 assert.equal(displayed.start,localTime);
 assert.equal(result.recurring,false);
});

test('reimport is idempotent; updates replace matching UID and preserve unrelated events',()=>{
 const parsed=parse(calendar(meeting));
 const first=mergeCalendarEvents([],parsed);
 assert.equal(first.added,1);
 const second=mergeCalendarEvents(first.events,parsed);
 assert.deepEqual([second.added,second.updated,second.unchanged],[0,0,1]);
 const unrelated=parse(calendar(event('other',['SUMMARY:Other','DTSTART;VALUE=DATE:20261009']))).events;
 const changed=parse(calendar(meeting.replace('SUMMARY:Lecture','SUMMARY:New title')));
 const merged=mergeCalendarEvents([...first.events,...unrelated],changed);
 assert.equal(merged.updated,1);assert.equal(merged.events.length,2);
 assert.equal(merged.events.find(e=>e.uid==='class-1').title,'New title');
});

test('all-day exclusive ends, default one-day duration and overnight events occupy correct dates',()=>{
 const parsed=parse(calendar(event('trip',['SUMMARY:Trip','DTSTART;VALUE=DATE:20261008','DTEND;VALUE=DATE:20261010']),event('one',['SUMMARY:One day','DTSTART;VALUE=DATE:20261011']),event('night',['SUMMARY:Night','DTSTART:20261008T230000','DTEND:20261009T010000'])));
 assert.equal(importedEventsForDate(parsed.events,'2026-10-08').length,2);
 assert.equal(importedEventsForDate(parsed.events,'2026-10-09').length,2);
 assert.equal(importedEventsForDate(parsed.events,'2026-10-10').length,0);
 assert.equal(importedEventsForDate(parsed.events,'2026-10-11')[0].allDay,true);
 assert.equal(importedEventsForDate(parsed.events,'2026-10-12').length,0);
 assert.equal(importedEventsForDate(parsed.events,'2026-10-09').find(e=>e.title==='Night').continuation,true);
});

test('recurrences respect COUNT, EXDATE and rescheduled exceptions',()=>{
 const master=event('weekly',['SUMMARY:Weekly','DTSTART:20261005T090000','DTEND:20261005T100000','RRULE:FREQ=WEEKLY;COUNT=4','EXDATE:20261012T090000']);
 const exception=event('weekly',['SUMMARY:Moved','RECURRENCE-ID:20261019T090000','DTSTART:20261020T110000','DTEND:20261020T120000']);
 const result=parse(calendar(master,exception));
 assert.equal(result.recurring,true);
 assert.deepEqual(result.events.map(e=>e.startDate),['2026-10-05','2026-10-20','2026-10-26']);
 assert.equal(result.events[1].title,'Moved');
 const onlyNovember= parseCalendarFile(calendar(master,exception),'classes.ics',{from:'2026-11-01',to:'2026-11-30'});
 assert.equal(onlyNovember.events.length,0);
});

test('reimport removes an excluded occurrence within the selected recurrence range',()=>{
 const master=event('weekly',['SUMMARY:Weekly','DTSTART:20261005T090000','DTEND:20261005T100000','RRULE:FREQ=WEEKLY;COUNT=4']);
 const existing=parse(calendar(master));
 const updated=parse(calendar(master.replace('END:VEVENT','EXDATE:20261012T090000\r\nEND:VEVENT')));
 const result=mergeCalendarEvents(existing.events,updated);
 assert.equal(result.removed,1);assert.equal(result.events.length,3);
});

test('IANA timezone without VTIMEZONE resolves through Intl with seasonal offsets',()=>{
 const result=parse(calendar(event('zone',['SUMMARY:Zone','DTSTART;TZID=America/New_York:20261008T090000','DTEND;TZID=America/New_York:20261008T100000'])));
 assert.equal(result.events[0].start,Date.parse('2026-10-08T13:00:00Z'));
 const winter=parseCalendarFile(calendar(event('zone',['SUMMARY:Zone','DTSTART;TZID=America/New_York:20261208T090000','DTEND;TZID=America/New_York:20261208T100000'])),'zone.ics',range);
 assert.equal(winter.events[0].start,Date.parse('2026-12-08T14:00:00Z'));
});

test('embedded time zones remain scoped to their own file',()=>{
 const zone='BEGIN:VTIMEZONE\r\nTZID:Custom/Office\r\nBEGIN:STANDARD\r\nDTSTART:19700101T000000\r\nTZOFFSETFROM:+0700\r\nTZOFFSETTO:+0700\r\nEND:STANDARD\r\nEND:VTIMEZONE';
 const meeting=event('office',['SUMMARY:Office','DTSTART;TZID=Custom/Office:20261008T090000','DTEND;TZID=Custom/Office:20261008T100000']);
 assert.equal(parse(calendar(zone,meeting)).events[0].start,Date.parse('2026-10-08T02:00:00Z'));
 assert.throws(()=>parse(calendar(meeting)),/calendarTimezoneError/);
});

test('rescheduled exceptions can move into the import range from a later original date',()=>{
 const master=event('weekly',['SUMMARY:Weekly','DTSTART:20261005T090000','DTEND:20261005T100000','RRULE:FREQ=WEEKLY;COUNT=20']);
 const exception=event('weekly',['SUMMARY:Moved','RECURRENCE-ID:20261207T090000','DTSTART:20261015T110000','DTEND:20261015T120000']);
 const result=parse(calendar(master,exception));
 assert.equal(result.events.find(e=>e.title==='Moved').startDate,'2026-10-15');
});

test('malformed files, unknown zones, duplicate identifiers and excessive recurrences fail without changing records',()=>{
 assert.throws(()=>parse('Not ICS'),/calendarInvalid/);
 assert.throws(()=>parse(calendar()),/calendarNoEvents/);
 assert.throws(()=>parse(calendar(meeting,meeting)),/calendarDuplicate/);
 assert.throws(()=>parse(calendar(meeting.replace('DTSTART:20261008T020000Z','DTSTART;TZID=Made\/Up:20261008T020000'))),/calendarTimezoneError/);
 assert.throws(()=>parse(calendar(event('bad',['DTSTART:20261008T090000','RRULE:FREQ=SECONDLY']))),/calendarRecurrenceError/);
 assert.throws(()=>parseCalendarFile(calendar(meeting),'x.ics',{from:'2026-02-30',to:'2026-03-01'}),/calendarRangeError/);
 assert.throws(()=>parse(calendar(meeting.replace('DTEND:20261008T040000Z','DTEND:20261007T040000Z'))),/calendarInvalid/);
 assert.throws(()=>parse(calendar(meeting.replace('20261008','20260230'))),/calendarInvalid/);
 assert.throws(()=>validateCalendarEvents([{key:'bad'}]),/calendarInvalid/);
});

test('imports survive JSON backup and integrate without converting date-specific events to weekly blocks',()=>{
 const parsed=parse(calendar(meeting));
 const restored=normalizeBackup(JSON.parse(JSON.stringify({profile:[{id:'profile',name:'Test',calendarEvents:parsed.events}]})));
 assert.deepEqual(restored.profile[0].calendarEvents,parsed.events);
 assert.equal(eventsForDate(restored,'2026-10-08')[0].kind,'imported');
 assert.deepEqual(eventsForDate(restored,'2026-10-15'),[]);
 assert.throws(()=>normalizeBackup({profile:[{id:'profile',calendarEvents:[{key:'bad'}]}]}),/calendarInvalid/);
});
