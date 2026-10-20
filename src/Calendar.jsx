import React,{useEffect,useMemo,useRef,useState} from 'react';
import {CalendarDays,ChevronLeft,ChevronRight,Plus} from 'lucide-react';
import CalendarImport from './CalendarImport.jsx';
import CalendarEventForm from './CalendarEventForm.jsx';
import {defaultCourseCatalog,courseForEvent,calendarEventTitle,coursesForImports} from './courseCatalog.js';
import {shiftDate,weekday} from './domain';
import {monthStart,shiftMonth,monthCells,eventsForDate} from './calendarModel.js';
import {shortDayNames} from './i18n';
import './calendar.css';

export default function Calendar({mobile,editorOpen,onOpenEditor,onCloseEditor,onCreate,data,date,onDateChange,today,language,t,busy,Modal,onImport,onRemoveImport,courseCatalog=defaultCourseCatalog}){
 const [detail,setDetail]=useState(null),[dayOpen,setDayOpen]=useState(false),[editingEvent,setEditingEvent]=useState(null);
 const imported=(data.profile?.[0]?.calendarEvents||[]).filter(event=>event.origin!=='manual');
 const courses=coursesForImports(imported,courseCatalog);
 const eventColor='#0891b2';
 const cellRefs=useRef(new Map()),focusDate=useRef(false);
 const locale=language==='th'?'th-TH':'en-US';
 const month=monthStart(date);
 const cells=useMemo(()=>monthCells(month),[month]);
 const events=useMemo(()=>new Map(cells.filter(key=>key.slice(0,7)===month.slice(0,7)).map(key=>[key,eventsForDate(data,key,courseCatalog)])),[data,cells,month,courseCatalog]);
 const detailCourse=detail?courseForEvent(detail,courseCatalog):null;
 const dayEvents=events.get(date)||[];
 const format=(key,options)=>new Date(key+'T12:00:00').toLocaleDateString(locale,options);
 useEffect(()=>{if(focusDate.current){cellRefs.current.get(date)?.focus();focusDate.current=false;}},[date]);
 const agendaContent=dayEvents.length?<div className="calendar-agenda-list">{dayEvents.map(event=><button type="button" disabled={busy} key={event.id} className="calendar-event" onClick={()=>{setDayOpen(false);setDetail(event.item);}} style={{'--event-color':eventColor}}><span className="calendar-event-icon"><CalendarDays size={19}/></span><span className="calendar-event-body"><strong>{event.title}</strong><span>{event.allDay?t('calendarAllDay'):event.start+'–'+event.end}{event.continuation?' · '+t('calendarContinuation'):''}{event.item.status==='CANCELLED'?' · '+t('calendarCancelled'):''}</span><small>{event.item.category||(event.item.origin==='manual'?t('calendarManualSource'):event.item.source)}</small></span></button>)}</div>:<div className="empty calendar-empty"><CalendarDays size={28}/><p>{t('calendarEmpty')}</p></div>;
 const openDay=key=>{onDateChange(key);setDayOpen(true);};
 const handleKeys=(event,key)=>{
  const offset={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7,Home:-((weekday(key)+6)%7),End:6-((weekday(key)+6)%7)}[event.key];
  let next=offset!==undefined?shiftDate(key,offset):event.key==='PageUp'?shiftMonth(key,-1):event.key==='PageDown'?shiftMonth(key,1):null;
  if(next){event.preventDefault();focusDate.current=true;onDateChange(next);}
 };
 return <div className="calendar-layout">
  <section className="panel calendar-month" aria-labelledby="calendar-month-title">
   <header className="calendar-toolbar">
    <h2 id="calendar-month-title" aria-live="polite">{format(date,{day:'numeric',month:'long',year:'numeric'})}</h2>
    <div className="calendar-month-controls">
     <button type="button" className="icon-btn" aria-label={t('previousMonth')} onClick={()=>onDateChange(shiftMonth(date,-1))}><ChevronLeft size={20}/></button>
     <button type="button" className="secondary calendar-today" onClick={()=>onDateChange(today)}>{t('today')}</button>
     <button type="button" className="icon-btn" aria-label={t('nextMonth')} onClick={()=>onDateChange(shiftMonth(date,1))}><ChevronRight size={20}/></button>
    </div>
   </header>
   <div className="calendar-weekdays" aria-hidden="true">{[1,2,3,4,5,6,0].map(day=><span key={day}>{shortDayNames[language][day]}</span>)}</div>
   <div className="calendar-grid" role="group" aria-label={t('calendarChooseDate')}>
    {cells.map(key=>{
     const outside=key.slice(0,7)!==month.slice(0,7),list=events.get(key)||[];
     const label=format(key,{weekday:'long',day:'numeric',month:'long',year:'numeric'})+(outside?'':', '+list.length+' '+t('calendarItems'));
     return <button key={key} ref={node=>{if(node)cellRefs.current.set(key,node);else cellRefs.current.delete(key);}} type="button" className={'calendar-day '+(outside?'outside ':'')+(!outside&&key===today?'is-today ':'')+(key===date?'selected':'')} aria-label={label} aria-pressed={key===date} aria-current={key===today?'date':undefined} tabIndex={key===date?0:-1} aria-haspopup="dialog" onClick={()=>onDateChange(key)} onDoubleClick={()=>openDay(key)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openDay(key);}else handleKeys(event,key);}}>
      <span className="calendar-day-number">{Number(key.slice(-2))}</span>
      <span className="calendar-day-previews" aria-hidden="true">{list.slice(0,2).map(event=><span key={event.id} className="calendar-day-preview" style={{'--event-color':eventColor}}><i/>{event.title}</span>)}{list.length>2&&<span className="calendar-overflow">+{list.length-2}</span>}</span>
      {!!list.length&&<span className="calendar-day-dots" aria-hidden="true"><i className="import-dot"/><small>{list.length}</small></span>}
     </button>;
    })}
   </div>
  </section>
  <section className="panel calendar-agenda" aria-labelledby="calendar-day-title">
   <header className="calendar-agenda-heading"><span className="calendar-eyebrow">{t('calendarSelectedDay')}</span><h2 id="calendar-day-title" aria-live="polite">{format(date,{weekday:'long',day:'numeric',month:'long'})}</h2><p className="muted">{dayEvents.length} {t('calendarItems')}</p></header>
   {agendaContent}
  </section>
  {dayOpen&&!editorOpen&&!detail&&<Modal title={format(date,{weekday:'long',day:'numeric',month:'long',year:'numeric'})} onClose={()=>setDayOpen(false)} footer={<><button type="button" className="primary calendar-day-add" disabled={busy} onClick={()=>{setDayOpen(false);onOpenEditor();}}><Plus size={17}/>{t('calendarAddEvent')}</button></>}><div className="calendar-day-dialog"><p className="muted calendar-day-count">{dayEvents.length} {t('calendarItems')}</p>{agendaContent}</div></Modal>}
  {(editorOpen||editingEvent)&&<Modal title={t(editingEvent?'calendarEditEvent':'calendarAddEvent')} onClose={()=>{setEditingEvent(null);onCloseEditor();}}><CalendarEventForm key={editingEvent?.key||date} event={editingEvent} {...{date,t,busy}} onSave={async event=>{const saved=await onCreate(event);if(saved)setEditingEvent(null);return saved;}} onCancel={()=>{setEditingEvent(null);onCloseEditor();}}/></Modal>}
  {!!courses.length&&<section className="panel calendar-courses" aria-labelledby="calendar-courses-title"><h2 id="calendar-courses-title">{t('calendarImportedCourses')}</h2><ul className="calendar-course-list">{courses.map(course=><li key={course.code}><strong>{course.code}</strong>{course.name&&<span>{course.name}</span>}</li>)}</ul></section>}
  <div className="panel calendar-import-toolbar"><CalendarImport {...{Modal,t,language,today,busy,courseCatalog}} events={imported} onSave={onImport}/>{!!imported.length&&<small className="muted">{imported.length} {t('calendarImportedItems')}</small>}</div>
  {detail&&<Modal title={calendarEventTitle(detail,courseCatalog)} onClose={()=>setDetail(null)} footer={<><button type="button" className="secondary danger" disabled={busy} onClick={()=>{onRemoveImport(detail);setDetail(null);}}>{t('delete')}</button><button type="button" className="secondary" disabled={busy} onClick={()=>{setEditingEvent(detail);setDetail(null);}}>{t('edit')}</button></>}><dl className="calendar-import-detail">{detailCourse&&<><dt>{t('calendarCourseCode')}</dt><dd>{detailCourse.code}</dd>{detailCourse.name&&<><dt>{t('calendarCourseName')}</dt><dd>{detailCourse.name}</dd></>}</>}<dt>{t(detail.origin==='manual'?'calendarEventTitle':'calendarOriginalTitle')}</dt><dd>{detail.title}</dd><dt>{t('calendarEventTime')}</dt><dd>{detail.allDay?format(detail.startDate,{day:'numeric',month:'long',year:'numeric'})+(detail.endDate>shiftDate(detail.startDate,1)?' – '+format(shiftDate(detail.endDate,-1),{day:'numeric',month:'long',year:'numeric'}):'')+' · '+t('calendarAllDay'):new Date(detail.start).toLocaleString(locale,{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'})+' – '+new Date(detail.end).toLocaleString(locale,{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'})}</dd>{detail.location&&<><dt>{t('calendarLocation')}</dt><dd>{detail.location}</dd></>}{detail.description&&<><dt>{t('description')}</dt><dd>{detail.description}</dd></>}{detail.category&&<><dt>{t('category')}</dt><dd>{detail.category}</dd></>}<dt>{t('calendarSource')}</dt><dd>{detail.origin==='manual'?t('calendarManualSource'):detail.source}</dd>{detail.status==='CANCELLED'&&<dd className="danger">{t('calendarCancelled')}</dd>}</dl></Modal>}
 </div>;
}
