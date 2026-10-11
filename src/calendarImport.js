import ICAL from 'ical.js';

export const CALENDAR_FILE_LIMIT=2*1024*1024;
const MAX_EVENTS=5000;
const fail=code=>{throw new Error(code);};
const localKey=date=>[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
const text=value=>String(value||'').slice(0,10000);

// ICAL resolves embedded VTIMEZONE definitions. Intl handles IANA TZIDs
// omitted by some exporters without registering global, cross-file zones.
function jsDate(time,component,property='dtstart'){
 if(!time||time.year<1900||time.year>2200)fail('calendarInvalid');
 const tzid=component.getFirstProperty(property)?.getParameter('tzid')||component.getFirstProperty('dtstart')?.getParameter('tzid');
 if(time.isDate||time.zone.tzid==='floating'&&!tzid)return new Date(time.year,time.month-1,time.day,time.hour,time.minute,time.second);
 if(time.zone.tzid!=='floating')return time.toJSDate();
 let formatter;
 try{formatter=new Intl.DateTimeFormat('en-GB',{timeZone:tzid,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});}catch{fail('calendarTimezoneError');}
 const target=Date.UTC(time.year,time.month-1,time.day,time.hour,time.minute,time.second);
 let stamp=target;
 for(let i=0;i<3;i++){
  const parts=Object.fromEntries(formatter.formatToParts(stamp).map(part=>[part.type,part.value]));
  const wall=Date.UTC(+parts.year,+parts.month-1,+parts.day,+parts.hour,+parts.minute,+parts.second);
  const next=stamp+target-wall;if(next===stamp)break;stamp=next;
 }
 return new Date(stamp);
}

export function parseCalendarFile(input,source,{from,to}={}){
 if(typeof input!=='string'||new TextEncoder().encode(input).length>CALENDAR_FILE_LIMIT)fail('calendarTooLarge');
 if(!validDate(from)||!validDate(to)||to<from||Date.parse(to)-Date.parse(from)>3*366*86400000)fail('calendarRangeError');
 try{
  const root=new ICAL.Component(ICAL.parse(input.replace(/^\uFEFF/,'')));
  if(root.name!=='vcalendar'||root.getFirstPropertyValue('version')!=='2.0')fail('calendarInvalid');
  const components=root.getAllSubcomponents('vevent');
  if(!components.length)fail('calendarNoEvents');
  if(components.length>2000)fail('calendarTooMany');
  for(const component of components){
   for(const name of ['dtstart','dtend','recurrence-id','exdate','rdate'])for(const property of component.getAllProperties(name)){
    if(property.type==='period')fail('calendarRecurrenceError');
    for(const value of property.toJSON().slice(3)){
     const start=Array.isArray(value)?value[0]:value;
     if(typeof start==='string'&&(!validDate(start.slice(0,10))||start.length>10&&!/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\dZ?$/.test(start)))fail('calendarInvalid');
    }
   }
   if(component.getFirstProperty('recurrence-id')?.getParameter('range'))fail('calendarRecurrenceError');
  }
  const seen=new Set(),records=[],series=[];
  let recurring=false,steps=0;
  const add=(event,start,end,occurrence)=>{
   if(!start||!end||start.isDate!==end.isDate)fail('calendarInvalid');
   const begin=jsDate(start,event.component),finish=jsDate(end,event.component,'dtend');
   if(!Number.isFinite(+begin)||!Number.isFinite(+finish)||finish<begin||start.isDate&&finish<=begin)fail('calendarInvalid');
   const uid=String(event.uid||'');if(!uid||uid.length>1000)fail('calendarInvalid');
   const key=JSON.stringify([uid,occurrence||'']);
   if(seen.has(key))fail('calendarDuplicate');seen.add(key);
   records.push({key,uid,title:text(event.summary)||'Untitled',description:text(event.description),location:text(event.location),category:text(event.component.getAllProperties('categories').flatMap(p=>p.getValues()).join(', ')),start:+begin,end:+finish,allDay:start.isDate,startDate:start.isDate?start.toString():localKey(begin),endDate:end.isDate?end.toString():localKey(finish),status:text(event.component.getFirstPropertyValue('status')),source:String(source||'Calendar.ics').slice(0,200),occurrence:occurrence||''});
   if(records.length>MAX_EVENTS)fail('calendarTooMany');
  };
  const masters=new Set(components.filter(c=>!c.hasProperty('recurrence-id')).map(c=>c.getFirstPropertyValue('uid')));
  for(const component of components){
   if(component.hasProperty('recurrence-id')&&masters.has(component.getFirstPropertyValue('uid')))continue;
   const uid=component.getFirstPropertyValue('uid');
   const exceptions=components.filter(c=>c.hasProperty('recurrence-id')&&c.getFirstPropertyValue('uid')===uid);
   const event=new ICAL.Event(component,{exceptions});
   if(!event.startDate)fail('calendarInvalid');
   if(!event.isRecurring()){add(event,event.startDate,event.endDate,event.recurrenceId?.toString());continue;}
   recurring=true;
   for(const property of component.getAllProperties('rrule')){
    const rule=property.getFirstValue();
    if(!['DAILY','WEEKLY','MONTHLY','YEARLY'].includes(rule.freq)||Object.values(rule.parts).reduce((count,part)=>count*part.length,1)>100)fail('calendarRecurrenceError');
   }
   series.push({uid,from,to});
   const iterator=event.iterator();let occurrence;
   const cutoff=new Date(to+'T12:00:00Z');cutoff.setUTCDate(cutoff.getUTCDate()+2);
   const inRange=(item,startTime,endTime)=>{
    const start=jsDate(startTime,item.component),end=jsDate(endTime,item.component,'dtend');
    const day=startTime.isDate?startTime.toString():localKey(start);
    return day<=to&&(end>new Date(from+'T00:00:00')||+start===+end&&day>=from);
   };
   // Start at the original DTSTART so COUNT/BYDAY semantics remain intact.
   while((occurrence=iterator.next())){
    if(++steps>50000)fail('calendarTooMany');
    if(occurrence.toString().slice(0,10)>cutoff.toISOString().slice(0,10))break;
    const detail=event.getOccurrenceDetails(occurrence);
    if(inRange(detail.item,detail.startDate,detail.endDate))add(detail.item,detail.startDate,detail.endDate,occurrence.toString());
   }
   // An exception can move a later occurrence into the chosen date range.
   for(const component of exceptions){const exception=new ICAL.Event(component);const occurrence=exception.recurrenceId.toString();if(!seen.has(JSON.stringify([uid,occurrence]))&&inRange(exception,exception.startDate,exception.endDate))add(exception,exception.startDate,exception.endDate,occurrence);}
  }
  records.sort((a,b)=>a.start-b.start||a.title.localeCompare(b.title));
  return {events:records,recurring,series,source:String(source||'Calendar.ics').slice(0,200)};
 }catch(error){if(error.message.startsWith('calendar'))throw error;fail('calendarInvalid');}
}

export function validateCalendarEvents(events=[]){
 if(!Array.isArray(events)||events.length>MAX_EVENTS||JSON.stringify(events).length>CALENDAR_FILE_LIMIT*2)fail('calendarTooMany');
 const keys=new Set();
 for(const e of events){
  if(!e||typeof e!=='object'||typeof e.uid!=='string'||!e.uid||e.uid.length>1000||typeof e.occurrence!=='string'||e.occurrence.length>100||e.key!==JSON.stringify([e.uid,e.occurrence])||keys.has(e.key)||typeof e.allDay!=='boolean'||!Number.isFinite(new Date(e.start).getTime())||!Number.isFinite(new Date(e.end).getTime())||!Number.isFinite(e.start)||!Number.isFinite(e.end)||e.end<e.start||!validDate(e.startDate)||!validDate(e.endDate)||e.endDate<e.startDate||e.allDay&&e.endDate<=e.startDate)fail('calendarInvalid');
  for(const field of ['title','description','location','category','status','source'])if(typeof e[field]!=='string'||e[field].length>(field==='source'?200:10000))fail('calendarInvalid');
  keys.add(e.key);
 }
 return events;
}

export function mergeCalendarEvents(current=[],parsed){
 validateCalendarEvents(current);validateCalendarEvents(parsed.events);
 const incoming=new Map(parsed.events.map(e=>[e.key,e]));
 const next=new Map(current.map(e=>[e.key,e]));
 let added=0,updated=0,unchanged=0,removed=0;
 for(const e of current){
  if(e.occurrence&&!incoming.has(e.key)&&parsed.series.some(s=>s.uid===e.uid&&e.occurrence.slice(0,10)>=s.from&&e.occurrence.slice(0,10)<=s.to)){next.delete(e.key);removed++;}
 }
 for(const e of parsed.events){
  const previous=next.get(e.key);
  const comparable=value=>JSON.stringify({...value,source:''});
  if(!previous)added++;
  else if(comparable(previous)===comparable(e)){unchanged++;continue;}
  else updated++;
  next.set(e.key,e);
 }
 const events=[...next.values()].sort((a,b)=>a.start-b.start||a.title.localeCompare(b.title));
 validateCalendarEvents(events);
 return {events,added,updated,unchanged,removed};
}

export function importedEventsForDate(events=[],key){
 const midnight=+new Date(key+'T00:00:00'),nextDay=new Date(midnight);nextDay.setDate(nextDay.getDate()+1);
 const clock=stamp=>new Date(stamp).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
 return events.filter(e=>e.allDay?e.startDate<=key&&e.endDate>key:e.start<+nextDay&&(e.end>midnight||e.start===e.end&&e.start>=midnight)).map(item=>({id:'import-'+item.key,kind:'imported',title:item.title,item,allDay:item.allDay,start:item.allDay?'':item.start<midnight?'00:00':clock(item.start),end:item.allDay?'':item.end>=+nextDay?'24:00':clock(item.end),continuation:item.allDay?item.startDate<key:item.start<midnight}));
}
