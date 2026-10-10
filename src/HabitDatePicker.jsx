import React,{useLayoutEffect,useMemo,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight} from 'lucide-react';
import {shiftDate,weekday} from './domain';
import {shortDayNames} from './i18n';
import DateInput from './DateInput';
import {dateStripDays} from './dateStrip';
import './habitDatePicker.css';

const dateLabel=(date,language)=>new Date(date+'T12:00:00').toLocaleDateString(language==='th'?'th-TH':'en-US',{day:'numeric',month:'short',year:'numeric'});

export default function HabitDatePicker({date,today,t,language,onChange,mobile=false}){
 const [past,setPast]=useState(28),[future,setFuture]=useState(28),[atEnd,setAtEnd]=useState(true),[dragging,setDragging]=useState(false);
 const stripRef=useRef(null),selectedRef=useRef(null),anchorRef=useRef({date:null,mobile:null}),pendingRef=useRef(null),dragRef=useRef(null),suppressClick=useRef(false),focusRef=useRef(null);
 const days=useMemo(()=>mobile?dateStripDays(date,today,past,future):Array.from({length:7},(_,i)=>shiftDate(date,i-3)),[mobile,date,today,past,future]);
 const end=days.at(-1),latest=shiftDate(today,3);
 const centerSelection=(behavior='auto')=>{
  const strip=stripRef.current,selected=selectedRef.current;
  if(!mobile||!strip||!selected)return;
  const left=selected.getBoundingClientRect().left-strip.getBoundingClientRect().left+strip.scrollLeft+(selected.offsetWidth-strip.clientWidth)/2;
  strip.scrollTo({left,behavior});
 };
 useLayoutEffect(()=>{
  const strip=stripRef.current;
  if(mobile&&strip){
   if(anchorRef.current.date!==date||anchorRef.current.mobile!==mobile){pendingRef.current=null;centerSelection();}
   else if(pendingRef.current){
    const pending=pendingRef.current,added=pending.prepend?strip.scrollWidth-pending.width:0;
    strip.scrollLeft=pending.left+added;
    if(dragRef.current)dragRef.current.left+=added;
    pendingRef.current=null;
   }
   setAtEnd(end===latest&&strip.scrollWidth-strip.clientWidth-strip.scrollLeft<3);
   if(focusRef.current===date){selectedRef.current?.focus({preventScroll:true});focusRef.current=null;}
  }
  anchorRef.current={date,mobile};
 },[days,date,mobile]);
 const chooseDate=day=>{
  if(mobile&&day===date)centerSelection(matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth');
  else onChange(day);
 };
 const scrollDates=direction=>{
  const strip=stripRef.current;
  strip?.scrollBy({left:direction*(strip.clientWidth+2),behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
 };
 const handleScroll=e=>{
  if(!mobile)return;
  const strip=e.currentTarget,remaining=strip.scrollWidth-strip.clientWidth-strip.scrollLeft;
  setAtEnd(end===latest&&remaining<3);
  if(pendingRef.current||!strip.clientWidth)return;
  if(strip.scrollLeft<strip.clientWidth/2){pendingRef.current={prepend:true,width:strip.scrollWidth,left:strip.scrollLeft};setPast(value=>value+28);}
  else if(end<latest&&remaining<strip.clientWidth/2){pendingRef.current={prepend:false,width:strip.scrollWidth,left:strip.scrollLeft};setFuture(value=>value+28);}
 };
 const startDrag=e=>{
  suppressClick.current=false;
  if(!mobile||e.pointerType==='touch'||e.button!==0)return;
  dragRef.current={id:e.pointerId,x:e.clientX,left:e.currentTarget.scrollLeft};
 };
 const moveDrag=e=>{
  const drag=dragRef.current;
  if(!drag||drag.id!==e.pointerId)return;
  const distance=e.clientX-drag.x;
  if(Math.abs(distance)>6){suppressClick.current=true;setDragging(true);e.currentTarget.setPointerCapture(e.pointerId);}
  if(suppressClick.current){e.preventDefault();e.currentTarget.scrollLeft=drag.left-distance;}
 };
 const endDrag=e=>{
  if(!dragRef.current||dragRef.current.id!==e.pointerId)return;
  if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  dragRef.current=null;setDragging(false);
 };
 const dateKeys=e=>{
  if(!mobile||!['ArrowLeft','ArrowRight'].includes(e.key)||!e.target.dataset.date)return;
  e.preventDefault();
  const next=shiftDate(e.target.dataset.date,e.key==='ArrowLeft'?-1:1);
  if(next<=today){focusRef.current=next;chooseDate(next);}
 };
 return <>
  <div className="date-strip"><button className="icon-btn" type="button" aria-label={t('previousWeek')} onClick={()=>mobile?scrollDates(-1):onChange(shiftDate(date,-7))}><ChevronLeft size={18}/></button><div ref={stripRef} className={'date-days '+(mobile?'mobile-date-days ':'')+(dragging?'dragging':'')} onScroll={handleScroll} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onKeyDown={dateKeys} onClickCapture={e=>{if(suppressClick.current){e.preventDefault();e.stopPropagation();suppressClick.current=false;}}}>{days.map(day=><button ref={day===date?selectedRef:undefined} key={day} data-date={day} tabIndex={mobile&&day!==date?-1:0} type="button" disabled={day>today} className={day===date?'selected':''} aria-pressed={day===date} aria-label={dateLabel(day,language)} onClick={()=>chooseDate(day)}><small>{shortDayNames[language][weekday(day)]}</small><strong>{new Date(day+'T12:00:00').getDate()}</strong><i className={day===today?'today-dot':''}/></button>)}</div><button className="icon-btn" type="button" aria-label={t('nextWeek')} disabled={mobile?atEnd:date>=today} onClick={()=>mobile?scrollDates(1):onChange(shiftDate(date,7)>today?today:shiftDate(date,7))}><ChevronRight size={18}/></button></div>
  <div className="toolbar history-date-toolbar"><DateInput className="habit-date-field" value={date} max={today} onChange={event=>event.target.value&&event.target.value<=today&&chooseDate(event.target.value)} aria-label={t('day')}/><button className="secondary" type="button" onClick={()=>chooseDate(today)}>{t('today')}</button></div>
 </>;
}
