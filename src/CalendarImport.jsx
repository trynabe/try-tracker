import React,{useRef,useState} from 'react';
import {Upload,FileText} from 'lucide-react';
import {CALENDAR_FILE_LIMIT,parseCalendarFile,mergeCalendarEvents} from './calendarImport.js';
import {calendarEventTitle} from './courseCatalog.js';

export default function CalendarImport({Modal,t,language,today,events,busy,onSave,courseCatalog}){
 const input=useRef(null),readVersion=useRef(0);
 const [open,setOpen]=useState(false),[parsed,setParsed]=useState(null),[raw,setRaw]=useState(null),[error,setError]=useState(''),[reading,setReading]=useState(false),[limit,setLimit]=useState(40);
 const nextYear=new Date(today+'T12:00:00');nextYear.setFullYear(nextYear.getFullYear()+1);
 const [from,setFrom]=useState(today),[to,setTo]=useState([nextYear.getFullYear(),String(nextYear.getMonth()+1).padStart(2,'0'),String(nextYear.getDate()).padStart(2,'0')].join('-'));
 const [rangeDirty,setRangeDirty]=useState(false);
 let preview=null,previewError='';
 try{if(parsed)preview=mergeCalendarEvents(events,parsed);}catch(e){previewError=t(e.message);}
 const close=()=>{if(busy||reading)return;readVersion.current++;setOpen(false);setParsed(null);setRaw(null);setError('');};
 const parse=(text,name,start=from,end=to)=>{
  try{setParsed(parseCalendarFile(text,name,{from:start,to:end}));setError('');setRangeDirty(false);setLimit(40);}catch(e){setError(t(e.message));}
 };
 const choose=async event=>{
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  setOpen(true);setParsed(null);setError('');setRaw(null);setReading(true);
  const version=++readVersion.current;
  try{
   if(file.size>CALENDAR_FILE_LIMIT)throw Error('calendarTooLarge');
   const value=await file.text();if(version!==readVersion.current)return;
   setRaw({text:value,name:file.name});parse(value,file.name);
  }catch(e){if(version===readVersion.current)setError(t(e.message==='calendarTooLarge'?e.message:'calendarInvalid'));}
  finally{if(version===readVersion.current)setReading(false);}
 };
 const dateLabel=event=>event.allDay?new Date(event.startDate+'T12:00:00').toLocaleDateString(language==='th'?'th-TH':'en-US',{day:'numeric',month:'short',year:'numeric'})+' · '+t('calendarAllDay'):new Date(event.start).toLocaleString(language==='th'?'th-TH':'en-US',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
 return <>
  <input ref={input} type="file" accept=".ics,text/calendar" hidden onChange={choose}/>
  <button type="button" className="secondary calendar-import-button" disabled={busy||reading} onClick={()=>input.current?.click()}><Upload size={16}/>{t('calendarImport')}</button>
  {open&&<Modal title={t('calendarImport')} onClose={close} footer={<><button type="button" className="secondary" disabled={busy||reading} onClick={close}>{t('cancel')}</button><button type="button" className="primary" disabled={busy||reading||rangeDirty||!preview||!!error||!!previewError||!(preview.added+preview.updated+preview.removed)} onClick={async()=>{if(await onSave(parsed)){setOpen(false);setParsed(null);setRaw(null);}}}>{busy?t('saving'):t('calendarConfirmImport')}</button></>}>
   <p className="muted calendar-import-hint">{t('calendarImportHint')}</p>
   {reading&&<p role="status">{t('calendarReading')}</p>}
   {(error||previewError)&&<p className="danger" role="alert">{error||previewError}</p>}
   {parsed&&<>
    <div className="calendar-import-file"><FileText size={20}/><strong>{parsed.source}</strong><span>{parsed.events.length} {t('calendarItems')}</span></div>
    {parsed.recurring&&<div className="calendar-import-range"><p className="muted">{t('calendarRecurringRange')}</p><div><label className="field"><span>{t('calendarFrom')}</span><input type="date" value={from} onChange={e=>{setFrom(e.target.value);setRangeDirty(true);}}/></label><label className="field"><span>{t('calendarTo')}</span><input type="date" value={to} onChange={e=>{setTo(e.target.value);setRangeDirty(true);}}/></label></div><button type="button" className="secondary" disabled={busy} onClick={()=>parse(raw.text,raw.name)}>{t('calendarRefreshPreview')}</button></div>}
    {preview&&<div className="calendar-import-counts" aria-live="polite">{[['added','calendarNew'],['updated','calendarUpdated'],['unchanged','calendarUnchanged'],['removed','calendarRemoved']].map(([key,label])=><span key={key}><strong>{preview[key]}</strong>{t(label)}</span>)}</div>}
    <p className="muted calendar-import-hint">{t('calendarLocalTime')} · {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
    <ul className="calendar-import-preview">{parsed.events.slice(0,limit).map(event=><li key={event.key}><strong>{calendarEventTitle(event,courseCatalog)}</strong><span>{dateLabel(event)}</span>{(event.location||event.description)&&<small>{event.location||event.description}</small>}</li>)}</ul>
    {parsed.events.length>limit&&<button type="button" className="secondary" onClick={()=>setLimit(limit+40)}>{t('calendarShowMore')} ({parsed.events.length-limit})</button>}
   </>}
   {error&&<button type="button" className="secondary" disabled={reading} onClick={()=>input.current?.click()}>{t('calendarChooseAnother')}</button>}
  </Modal>}
 </>;
}
