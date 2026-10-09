import React from 'react';
import {ChevronLeft,ChevronRight} from 'lucide-react';
import {shiftDate,weekday} from './domain';
import {shortDayNames} from './i18n';

const dateLabel=(date,language)=>new Date(date+'T12:00:00').toLocaleDateString(language==='th'?'th-TH':'en-US',{day:'numeric',month:'short',year:'numeric'});

export default function HabitDatePicker({date,today,t,language,onChange}){
 return <>
  <div className="date-strip"><button className="icon-btn" type="button" aria-label={t('previousWeek')} onClick={()=>onChange(shiftDate(date,-7))}><ChevronLeft size={18}/></button><div className="date-days">{Array.from({length:7},(_,i)=>shiftDate(date,i-3)).map(day=><button key={day} type="button" disabled={day>today} className={day===date?'selected':''} aria-pressed={day===date} aria-label={dateLabel(day,language)} onClick={()=>onChange(day)}><small>{shortDayNames[language][weekday(day)]}</small><strong>{new Date(day+'T12:00:00').getDate()}</strong><i className={day===today?'today-dot':''}/></button>)}</div><button className="icon-btn" type="button" aria-label={t('nextWeek')} disabled={date>=today} onClick={()=>onChange(shiftDate(date,7)>today?today:shiftDate(date,7))}><ChevronRight size={18}/></button></div>
  <div className="toolbar history-date-toolbar"><input type="date" value={date} max={today} onChange={event=>event.target.value&&event.target.value<=today&&onChange(event.target.value)} aria-label={t('day')}/><button className="secondary" type="button" onClick={()=>onChange(today)}>{t('today')}</button></div>
 </>;
}
