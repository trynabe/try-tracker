import {dateKey,shiftDate,uid} from './domain.js';
import {validateCalendarEvents} from './calendarImport.js';

const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&value>='1900-01-01'&&value<='2200-12-31'&&Number.isFinite(Date.parse(value))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;

function eventFromDraft({title,date,endDate=date,allDay=false,startTime='09:00',endTime='10:00',location='',description=''},id,original){
 const name=String(title||'').trim();
 if(!name||name.length>(original?10000:200))throw Error(original?'calendarEventEditTitleError':'calendarEventTitleError');
 if(!validDate(date)||!validDate(endDate)||endDate<date)throw Error('calendarEventDateError');
 if(!allDay&&(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(startTime)||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(endTime)))throw Error('calendarEventTimeError');
 const finishDate=allDay?shiftDate(endDate,1):endDate;
 const start=+new Date(date+'T'+(allDay?'00:00':startTime)+':00');
 const end=+new Date(finishDate+'T'+(allDay?'00:00':endTime)+':00');
 if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)throw Error('calendarEventTimeError');
 const eventUid=original?.uid||'manual-'+id;
 const event={...(original||{key:JSON.stringify([eventUid,'']),uid:eventUid,occurrence:'',origin:'manual',category:'',status:'',source:'TRY-TRACKER'}),title:name,start,end,allDay,startDate:dateKey(new Date(start)),endDate:allDay?finishDate:dateKey(new Date(end)),location:String(location).trim(),description:String(description).trim()};
 validateCalendarEvents([event]);
 return event;
}

export const createCalendarEvent=(draft,id=uid())=>eventFromDraft(draft,id);
export const updateCalendarEvent=(event,draft)=>{
 const next=eventFromDraft(draft,null,event),previous=calendarEventDraft(event);
 if(draft.allDay===previous.allDay){
  if(draft.date===previous.date&&(draft.allDay||draft.startTime===previous.startTime))next.start=event.start;
  if(draft.endDate===previous.endDate&&(draft.allDay||draft.endTime===previous.endTime))next.end=event.end;
 }
 validateCalendarEvents([next]);
 return next;
};

export function calendarEventDraft(event,date){
 if(!event)return {title:'',date,endDate:date,allDay:false,startTime:'09:00',endTime:'10:00',location:'',description:''};
 const clock=stamp=>{const value=new Date(stamp);return String(value.getHours()).padStart(2,'0')+':'+String(value.getMinutes()).padStart(2,'0');};
 return {title:event.title,date:event.allDay?event.startDate:dateKey(new Date(event.start)),endDate:event.allDay?shiftDate(event.endDate,-1):dateKey(new Date(event.end)),allDay:event.allDay,startTime:event.allDay?'09:00':clock(event.start),endTime:event.allDay?'10:00':clock(event.end),location:event.location,description:event.description};
}
