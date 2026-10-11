import {importedEventsForDate} from './calendarImport.js';
import {calendarEventTitle} from './courseCatalog.js';
import {dateKey,shiftDate,weekday} from './domain.js';

export const monthStart=key=>key.slice(0,7)+'-01';

export function shiftMonth(key,offset){
 const date=new Date(key+'T12:00:00');
 const day=date.getDate();
 date.setDate(1);
 date.setMonth(date.getMonth()+offset);
 const lastDay=new Date(date.getFullYear(),date.getMonth()+1,0).getDate();
 date.setDate(Math.min(day,lastDay));
 return dateKey(date);
}

export function monthCells(key){
 const first=monthStart(key);
 const leading=(weekday(first)+6)%7;
 const date=new Date(first+'T12:00:00');
 const days=new Date(date.getFullYear(),date.getMonth()+1,0).getDate();
 const count=Math.ceil((leading+days)/7)*7;
 return Array.from({length:count},(_,index)=>shiftDate(first,index-leading));
}

export function eventsForDate(data,key,catalog){
 const imported=importedEventsForDate(data.profile?.[0]?.calendarEvents||[],key).map(event=>({...event,title:calendarEventTitle(event.item,catalog)}));
 return imported.sort((a,b)=>Number(!!b.allDay)-Number(!!a.allDay)||a.start.localeCompare(b.start)||a.title.localeCompare(b.title));
}
