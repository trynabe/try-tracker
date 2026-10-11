import React,{useEffect,useMemo,useRef,useState} from 'react';
import {CalendarDays,ChevronLeft,ChevronRight,ListTodo,Clock,Plus,Check,Download,Trash2} from 'lucide-react';
import CalendarImport from './CalendarImport.jsx';
import {defaultCourseCatalog,courseForEvent,calendarEventTitle} from './courseCatalog.js';
import {shiftDate,weekday} from './domain';
import {monthStart,shiftMonth,monthCells,eventsForDate} from './calendarModel.js';
import {shortDayNames} from './i18n';
import {scheduleColor} from './scheduleColors';
import './calendar.css';

export default function Calendar({data,date,onDateChange,today,language,t,busy,onEdit,onAddTask,onAddBlock,Modal,onImport,onRemoveImport,courseCatalog=defaultCourseCatalog}){
 const [filter,setFilter]=useState('all'),[detail,setDetail]=useState(null);
 const imported=data.profile?.[0]?.calendarEvents||[];
 const eventColor=event=>event.kind==='tasks'?'var(--highlight)':event.kind==='imported'?'#0891b2':scheduleColor(event.item);
 const cellRefs=useRef(new Map()),focusDate=useRef(false);
 const locale=language==='th'?'th-TH':'en-US';
 const month=monthStart(date);
 const cells=useMemo(()=>monthCells(month),[month]);
 const events=useMemo(()=>new Map(cells.filter(key=>key.slice(0,7)===month.slice(0,7)).map(key=>[key,eventsForDate(data,key,courseCatalog).filter(event=>filter==='all'||event.kind===filter)])),[data,cells,month,filter,courseCatalog]);
 const detailCourse=detail?courseForEvent(detail,courseCatalog):null;
 const dayEvents=events.get(date)||[];
 const format=(key,options)=>new Date(key+'T12:00:00').toLocaleDateString(locale,options);
 useEffect(()=>{if(focusDate.current){cellRefs.current.get(date)?.focus();focusDate.current=false;}},[date]);
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
   <div className="calendar-filters" role="group" aria-label={t('calendarFilter')}>
    {[['all',CalendarDays],['tasks',ListTodo],['timeblocks',Clock],['imported',Download]].map(([key,Icon])=><button type="button" key={key} aria-pressed={filter===key} className={filter===key?'selected':''} onClick={()=>setFilter(key)}><Icon size={15}/>{t(key==='timeblocks'?'schedule':key==='imported'?'calendarImportedFilter':key)}</button>)}
   </div>
   <div className="calendar-weekdays" aria-hidden="true">{[1,2,3,4,5,6,0].map(day=><span key={day}>{shortDayNames[language][day]}</span>)}</div>
   <div className="calendar-grid" role="group" aria-label={t('calendarChooseDate')}>
    {cells.map(key=>{
     const outside=key.slice(0,7)!==month.slice(0,7),list=events.get(key)||[];
     const taskCount=list.filter(event=>event.kind==='tasks').length,blockCount=list.filter(event=>event.kind==='timeblocks').length,importCount=list.length-taskCount-blockCount;
     const label=format(key,{weekday:'long',day:'numeric',month:'long',year:'numeric'})+(outside?'':', '+taskCount+' '+t('tasks')+', '+blockCount+' '+t('schedule')+', '+importCount+' '+t('calendarImportedFilter'));
     return <button key={key} ref={node=>{if(node)cellRefs.current.set(key,node);else cellRefs.current.delete(key);}} type="button" className={'calendar-day '+(outside?'outside ':'')+(!outside&&key===today?'is-today ':'')+(key===date?'selected':'')} aria-label={label} aria-pressed={key===date} aria-current={key===today?'date':undefined} tabIndex={key===date?0:-1} onClick={()=>onDateChange(key)} onKeyDown={event=>handleKeys(event,key)}>
      <span className="calendar-day-number">{Number(key.slice(-2))}</span>
      <span className="calendar-day-previews" aria-hidden="true">{list.slice(0,2).map(event=><span key={event.id} className={'calendar-day-preview '+(event.done?'done':'')} style={{'--event-color':eventColor(event)}}><i/>{event.title}</span>)}{list.length>2&&<span className="calendar-overflow">+{list.length-2}</span>}</span>
      {!!list.length&&<span className="calendar-day-dots" aria-hidden="true">{taskCount>0&&<i className="task-dot"/>}{blockCount>0&&<i className="schedule-dot"/>}{importCount>0&&<i className="import-dot"/>}<small>{list.length}</small></span>}
     </button>;
    })}
   </div>
  </section>
  <section className="panel calendar-agenda" aria-labelledby="calendar-day-title">
   <header className="calendar-agenda-heading"><span className="calendar-eyebrow">{t('calendarSelectedDay')}</span><h2 id="calendar-day-title" aria-live="polite">{format(date,{weekday:'long',day:'numeric',month:'long'})}</h2><p className="muted">{dayEvents.length} {t('calendarItems')}</p></header>
   <div className="calendar-agenda-actions"><button type="button" className="secondary" disabled={busy} onClick={()=>onAddTask(date)}><Plus size={16}/>{t('addTask')}</button><button type="button" className="secondary" disabled={busy} onClick={()=>onAddBlock(date)}><Plus size={16}/>{t('addBlock')}</button></div>
   {dayEvents.length?<div className="calendar-agenda-list">{dayEvents.map(event=>{
    const Icon=event.kind==='tasks'?(event.done?Check:ListTodo):event.kind==='imported'?CalendarDays:Clock;
    return <button type="button" disabled={busy} key={event.id} className={'calendar-event '+(event.done?'done':'')} onClick={()=>event.kind==='imported'?setDetail(event.item):onEdit(event.kind,event.item)} style={{'--event-color':eventColor(event)}}><span className="calendar-event-icon"><Icon size={19}/></span><span className="calendar-event-body"><strong>{event.title}</strong><span>{event.kind==='tasks'?t(event.done?'completed':'dueDate'):event.allDay?t('calendarAllDay'):event.start+'–'+event.end}{event.continuation?' · '+t('calendarContinuation'):''}{event.item.status==='CANCELLED'?' · '+t('calendarCancelled'):''}</span><small>{event.kind==='tasks'?(event.item.tag||t('tasks')):event.kind==='imported'?(event.item.category||event.item.source):t('calendarWeekly')+(event.item.category?' · '+event.item.category:'')}</small></span></button>;
   })}</div>:<div className="empty calendar-empty"><CalendarDays size={28}/><p>{t('calendarEmpty')}</p></div>}
  </section>
  <div className="panel calendar-import-toolbar"><CalendarImport {...{Modal,t,language,today,busy,courseCatalog}} events={imported} onSave={onImport}/>{!!imported.length&&<small className="muted">{imported.length} {t('calendarImportedItems')}</small>}</div>
  {detail&&<Modal title={calendarEventTitle(detail,courseCatalog)} onClose={()=>setDetail(null)} footer={<><button type="button" className="secondary danger" disabled={busy} onClick={()=>{onRemoveImport(detail);setDetail(null);}}><Trash2 size={16}/>{t('delete')}</button><button type="button" className="secondary" onClick={()=>setDetail(null)}>{t('close')}</button></>}><dl className="calendar-import-detail">{detailCourse&&<><dt>{t('calendarCourseCode')}</dt><dd>{detailCourse.code}</dd>{detailCourse.name&&<><dt>{t('calendarCourseName')}</dt><dd>{detailCourse.name}</dd></>}</>}<dt>{t('calendarOriginalTitle')}</dt><dd>{detail.title}</dd><dt>{t('calendarEventTime')}</dt><dd>{detail.allDay?format(detail.startDate,{day:'numeric',month:'long',year:'numeric'})+(detail.endDate>shiftDate(detail.startDate,1)?' – '+format(shiftDate(detail.endDate,-1),{day:'numeric',month:'long',year:'numeric'}):'')+' · '+t('calendarAllDay'):new Date(detail.start).toLocaleString(locale,{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'})+' – '+new Date(detail.end).toLocaleString(locale,{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'})}</dd>{detail.location&&<><dt>{t('calendarLocation')}</dt><dd>{detail.location}</dd></>}{detail.description&&<><dt>{t('description')}</dt><dd>{detail.description}</dd></>}{detail.category&&<><dt>{t('category')}</dt><dd>{detail.category}</dd></>}<dt>{t('calendarSource')}</dt><dd>{detail.source}</dd>{detail.status==='CANCELLED'&&<dd className="danger">{t('calendarCancelled')}</dd>}</dl></Modal>}
 </div>;
}
