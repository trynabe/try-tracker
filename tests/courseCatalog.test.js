import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {defaultCourseCatalog,normalizeCourseCatalog,courseForEvent,calendarEventTitle} from '../src/courseCatalog.js';
import {eventsForDate} from '../src/calendarModel.js';
import {parseCalendarFile,mergeCalendarEvents} from '../src/calendarImport.js';

test('all ten supplied course names match the SQL seed for existing and new databases',()=>{
 const migration=readFileSync(new URL('../supabase/migrations/202610110001_course_catalog.sql',import.meta.url),'utf8');
 const schema=readFileSync(new URL('../supabase/schema.sql',import.meta.url),'utf8');
 const rows=[...migration.matchAll(/\('([A-Z]+\d{3})','([^']+)'\)/g)].map(([,code,name])=>({code,name}));
 assert.equal(defaultCourseCatalog.length,10);assert.deepEqual(rows,defaultCourseCatalog);
 assert.ok(schema.includes(migration));
});

test('MyCourses semester prefixes, category codes, casing and spaced codes match accurately',()=>{
 assert.equal(courseForEvent({title:'[Cancel]-691_ITDS211',category:'691_ITDS211'}).name,'Computer Architecture and Operating Systems');
 assert.equal(courseForEvent({title:'Quiz',category:'691_itds232'}).code,'ITDS232');
 assert.equal(courseForEvent({title:'ITDS 241'}).name,'Web Technologies and Applications');
 assert.equal(courseForEvent({title:'ITLG201_Reading Skills'}).name,'Reading Skills');
 assert.equal(courseForEvent({title:'Lab',description:'Room : IT304',uid:'ITDS211@school'}),null);
 assert.equal(courseForEvent({title:'XITDS2119'}),null);
 assert.equal(courseForEvent({title:'ITDS211 and ITDS212'}),null);
 assert.equal(courseForEvent({title:'Quiz 123 for ITDS211'}).code,'ITDS211');
});

test('display adds full names while retaining cancellation and meaningful event names',()=>{
 assert.equal(calendarEventTitle({title:'[Cancel]-691_ITDS211'}),'[Cancel] · ITDS211 · Computer Architecture and Operating Systems');
 assert.equal(calendarEventTitle({title:'691_ITDS231'}),'ITDS231 · Computer Networks');
 assert.equal(calendarEventTitle({title:'Midterm ITDS231'}),'Midterm ITDS231 · Computer Networks');
 assert.equal(calendarEventTitle({title:'ITDS231_Computer Networks'}),'ITDS231_Computer Networks');
 assert.equal(calendarEventTitle({title:'691_ITDS999'}),'691_ITDS999');
 assert.equal(courseForEvent({title:'691_ITDS999'}).name,'');
});

test('database course names take precedence and invalid rows cannot affect matching',()=>{
 const catalog=normalizeCourseCatalog([{code:' itds211 ',name:'Updated official name'},{code:'ITDS999',name:'New subject'},{code:'BAD CODE',name:'Ignored'},{code:'ITDS231',name:''}]);
 assert.equal(courseForEvent({title:'691_ITDS211'},catalog).name,'Updated official name');
 assert.equal(courseForEvent({title:'ITDS999'},catalog).name,'New subject');
 assert.equal(courseForEvent({title:'ITDS231'},catalog).name,'Computer Networks');
 assert.equal(catalog.length,11);
});

test('existing imports acquire names at display time without changing their source records or reimport identity',()=>{
 const ics='BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:example@school\r\nSUMMARY:691_ITDS211\r\nDESCRIPTION:Room : IT304\r\nCATEGORIES:691_ITDS211\r\nDTSTART;VALUE=DATE:20261011\r\nEND:VEVENT\r\nEND:VCALENDAR';
 const parsed=parseCalendarFile(ics,'classes.ics',{from:'2026-10-01',to:'2026-11-30'});
 const data={profile:[{calendarEvents:parsed.events}]};
 const before=JSON.stringify(data);
 assert.equal(eventsForDate(data,'2026-10-11')[0].title,'ITDS211 · Computer Architecture and Operating Systems');
 const custom=normalizeCourseCatalog([{code:'ITDS211',name:'Changed in database'}]);
 assert.equal(eventsForDate(data,'2026-10-11',custom)[0].title,'ITDS211 · Changed in database');
 assert.equal(JSON.stringify(data),before);
 assert.equal(mergeCalendarEvents(parsed.events,parsed).unchanged,1);
});
