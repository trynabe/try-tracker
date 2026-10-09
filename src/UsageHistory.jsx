import React,{useState} from 'react';
import {ChevronLeft,ChevronRight,CheckCheck,Clock} from 'lucide-react';
import {dateKey,shiftDate,weekday,formatClock} from './domain';
import {shortDayNames} from './i18n';
import {EntityIcon} from './icons';
import HabitCard from './HabitCard';

const dateLabel=(date,language)=>new Date(date+'T12:00:00').toLocaleDateString(language==='th'?'th-TH':'en-US',{day:'numeric',month:'short',year:'numeric'});

export default function UsageHistory({data,stats,today,t,language,busy,changeHabit}){
 const [view,setView]=useState('habits');
 const [date,setDate]=useState(today);
 const sessions=new Map();
 stats.sessions.forEach(session=>{
  const key=JSON.stringify([session.subjectId||session.subject,session.date]);
  const previous=sessions.get(key);
  sessions.set(key,{...session,seconds:(previous?.seconds||0)+session.durationSeconds,timestamp:Math.max(previous?.timestamp||0,session.timestamp||0)});
 });
 return <section className="usage-history" aria-labelledby="usage-history-title">
  <div className="usage-history-heading"><h2 id="usage-history-title">{t('usageHistory')}</h2><div className="segmented history-tabs" aria-label={t('usageHistory')}>{['habits','tasks','focus'].map(kind=><button key={kind} type="button" aria-pressed={view===kind} className={view===kind?'selected':''} onClick={()=>setView(kind)}>{t(kind)}</button>)}</div></div>
  {view==='habits'&&<>
   <p className="muted history-caption">{t('habitHistoryHint')}</p>
   <div className="date-strip"><button className="icon-btn" type="button" aria-label={t('previousWeek')} onClick={()=>setDate(shiftDate(date,-7))}><ChevronLeft size={18}/></button><div className="date-days">{Array.from({length:7},(_,i)=>shiftDate(date,i-3)).map(day=><button key={day} type="button" disabled={day>today} className={day===date?'selected':''} aria-pressed={day===date} aria-label={dateLabel(day,language)} onClick={()=>setDate(day)}><small>{shortDayNames[language][weekday(day)]}</small><strong>{new Date(day+'T12:00:00').getDate()}</strong><i className={day===today?'today-dot':''}/></button>)}</div><button className="icon-btn" type="button" aria-label={t('nextWeek')} disabled={date>=today} onClick={()=>setDate(shiftDate(date,7)>today?today:shiftDate(date,7))}><ChevronRight size={18}/></button></div>
   <div className="toolbar history-date-toolbar"><input type="date" value={date} max={today} onChange={event=>event.target.value&&event.target.value<=today&&setDate(event.target.value)} aria-label={t('day')}/><button className="secondary" type="button" onClick={()=>setDate(today)}>{t('today')}</button><strong className="history-selected-date">{dateLabel(date,language)}</strong></div>
   <div className="habit-collection-items cards">{data.habits.map(habit=><HabitCard key={habit.id} {...{habit,today,date,t,language,busy,changeHabit}} page="insights" showHistory onSelectDate={setDate}/>)}</div>
   {!data.habits.length&&<HistoryEmpty icon={CheckCheck} text={t('emptyHabits')}/>}
  </>}
  {view==='tasks'&&<div className="panel"><div className="section-head"><h2>{t('taskHistory')}</h2><span className="muted">{t('days'+stats.trend.length)}</span></div><div className="history-list task-history-list">{stats.completedTasks.map(task=><div key={task.id}><span className="emoji-tile small"><CheckCheck size={18}/></span><div className="row-main"><strong>{task.text}</strong><span className="row-meta">{dateLabel(dateKey(task.completedAt||task.createdAt),language)}{task.tag&&<span className="tag">{task.tag}</span>}</span></div></div>)}{!stats.completedTasks.length&&<HistoryEmpty icon={CheckCheck} text={t('emptyTaskHistory')}/>}</div></div>}
  {view==='focus'&&<div className="panel"><div className="section-head"><h2>{t('history')}</h2><strong className="accent-text">{stats.focusMinutes} {t('minutes')}</strong></div><p className="muted history-caption">{t('days'+stats.trend.length)}</p><div className="history-list">{[...sessions.values()].sort((a,b)=>b.date.localeCompare(a.date)||b.timestamp-a.timestamp).map(session=><div key={JSON.stringify([session.subjectId||session.subject,session.date])}><span className="emoji-tile small"><EntityIcon value={session.emoji} size={18}/></span><div className="row-main"><strong>{session.subject}</strong><span className="row-meta">{dateLabel(session.date,language)}</span></div><strong className="history-duration">{formatClock(session.seconds)}</strong></div>)}{!stats.sessions.length&&<HistoryEmpty icon={Clock} text={t('emptySessions')}/>}</div></div>}
 </section>;
}

const HistoryEmpty=({icon:Icon,text})=><div className="empty"><Icon size={24}/><p>{text}</p></div>;
