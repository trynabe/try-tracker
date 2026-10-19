import React,{useRef,useState} from 'react';
import {Plus,Check} from 'lucide-react';
import {createCalendarEvent,updateCalendarEvent,calendarEventDraft} from './calendarEvent.js';

export default function CalendarEventForm({date,event:original,t,busy,onSave,onCancel}){
 const initial=()=>calendarEventDraft(original,date);
 const [draft,setDraft]=useState(initial),[error,setError]=useState(''),[saving,setSaving]=useState(false);
 const savingRef=useRef(false);
 const change=(key,value)=>{setError('');setDraft(current=>({...current,[key]:value,...(key==='date'&&current.endDate<value?{endDate:value}:{})}));};
 const submit=async e=>{
  e.preventDefault();if(busy||savingRef.current)return;
  setError('');
  let event;try{event=original?updateCalendarEvent(original,draft):createCalendarEvent(draft);}catch(e){setError(t(e.message));return;}
  savingRef.current=true;setSaving(true);
  try{if(await onSave(event))setDraft(initial());}catch{setError(t('calendarEventSaveError'));}
  finally{savingRef.current=false;setSaving(false);}
 };
 return <form className="calendar-event-form" onSubmit={submit}>
  <fieldset disabled={busy||saving}>
   <label className="field"><span>{t('calendarEventTitle')}</span><input required maxLength={original?10000:200} value={draft.title} onChange={e=>change('title',e.target.value)} placeholder={t('calendarEventTitlePlaceholder')}/></label>
   <label className="calendar-all-day"><input type="checkbox" checked={draft.allDay} onChange={e=>change('allDay',e.target.checked)}/><span>{t('calendarAllDay')}</span></label>
   <div className="calendar-event-fields">
    <label className="field"><span>{t('calendarStartDate')}</span><input type="date" required min="1900-01-01" max="2200-12-31" value={draft.date} onChange={e=>change('date',e.target.value)}/></label>
    <label className="field"><span>{t('calendarEndDate')}</span><input type="date" required min={draft.date||'1900-01-01'} max="2200-12-31" value={draft.endDate} onChange={e=>change('endDate',e.target.value)}/></label>
    {!draft.allDay&&<><label className="field"><span>{t('startTime')}</span><input type="time" required value={draft.startTime} onChange={e=>change('startTime',e.target.value)}/></label><label className="field"><span>{t('endTime')}</span><input type="time" required value={draft.endTime} onChange={e=>change('endTime',e.target.value)}/></label></>}
   </div>
   <label className="field"><span>{t('calendarLocation')}</span><input maxLength={original?10000:500} value={draft.location} onChange={e=>change('location',e.target.value)}/></label>
   <label className="field"><span>{t('description')}</span><textarea rows={3} maxLength={original?10000:5000} value={draft.description} onChange={e=>change('description',e.target.value)}/></label>
   {error&&<p className="danger" role="alert">{error}</p>}
   <div className="calendar-event-actions">{onCancel&&<button type="button" className="secondary" onClick={onCancel}>{t('cancel')}</button>}<button type="submit" className="primary">{original?<Check size={17}/>:<Plus size={17}/>} {busy||saving?t('saving'):t(original?'save':'calendarAddEvent')}</button></div>
  </fieldset>
 </form>;
}
