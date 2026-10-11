import {importedEventsForDate} from './calendarImport.js';
import {calendarEventTitle} from './courseCatalog.js';
import {dateKey,shiftDate,weekday,minutes} from './domain.js';

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
 const tasks=(data.tasks||[]).filter(task=>!task.deletedAt&&task.dueDate===key).map(item=>({
  id:'task-'+item.id,kind:'tasks',title:item.text,done:!!item.done,item,
 }));
 const schedule=[];
 for(const item of data.timeblocks||[]){
  if(item.deletedAt)continue;
  const created=Number.isFinite(item.createdAt)?dateKey(item.createdAt):'0000-01-01';
  const start=Number(item.start.slice(0,2))*60+Number(item.start.slice(3));
  const end=start+minutes(item.start,item.end);
  if(item.day===weekday(key)&&key>=created){
   schedule.push({id:'block-'+item.id,kind:'timeblocks',title:item.title,start:item.start,end:end>1440?'24:00':item.end,continues:end>1440,item});
  }
  if(end>1440&&(item.day+1)%7===weekday(key)&&shiftDate(key,-1)>=created){
   schedule.push({id:'block-'+item.id+'-carry',kind:'timeblocks',title:item.title,start:'00:00',end:item.end,continuation:true,item});
  }
 }
 tasks.sort((a,b)=>Number(a.done)-Number(b.done)||a.title.localeCompare(b.title));
 schedule.sort((a,b)=>a.start.localeCompare(b.start)||a.title.localeCompare(b.title));
 const imported=importedEventsForDate(data.profile?.[0]?.calendarEvents||[],key).map(event=>({...event,title:calendarEventTitle(event.item,catalog)}));
 return [...tasks,...[...schedule,...imported].sort((a,b)=>Number(!!b.allDay)-Number(!!a.allDay)||a.start.localeCompare(b.start)||a.title.localeCompare(b.title))];
}
