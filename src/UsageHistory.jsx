import React,{useState} from 'react';
import {CheckCheck,Clock} from 'lucide-react';
import {dateKey,formatClock} from './domain';
import {EntityIcon} from './icons';

const dateLabel=(date,language)=>new Date(date+'T12:00:00').toLocaleDateString(language==='th'?'th-TH':'en-US',{day:'numeric',month:'short',year:'numeric'});

export default function UsageHistory({stats,t,language}){
 const [view,setView]=useState('tasks');
 const sessions=new Map();
 stats.sessions.forEach(session=>{
  const key=JSON.stringify([session.subjectId||session.subject,session.date]);
  const previous=sessions.get(key);
  sessions.set(key,{...session,seconds:(previous?.seconds||0)+session.durationSeconds,timestamp:Math.max(previous?.timestamp||0,session.timestamp||0)});
 });
 return <section className="usage-history" aria-labelledby="usage-history-title">
  <div className="usage-history-heading"><h2 id="usage-history-title">{t('usageHistory')}</h2><div className="segmented history-tabs" aria-label={t('usageHistory')}>{['tasks','focus'].map(kind=><button key={kind} type="button" aria-pressed={view===kind} className={view===kind?'selected':''} onClick={()=>setView(kind)}>{t(kind)}</button>)}</div></div>
  {view==='tasks'&&<div className="panel"><div className="section-head"><h2>{t('taskHistory')}</h2><span className="muted">{t('days'+stats.trend.length)}</span></div><div className="history-list task-history-list">{stats.completedTasks.map(task=><div key={task.id}><span className="emoji-tile small"><CheckCheck size={18}/></span><div className="row-main"><strong>{task.text}</strong><span className="row-meta">{dateLabel(dateKey(task.completedAt||task.createdAt),language)}{task.tag&&<span className="tag">{task.tag}</span>}</span></div></div>)}{!stats.completedTasks.length&&<HistoryEmpty icon={CheckCheck} text={t('emptyTaskHistory')}/>}</div></div>}
  {view==='focus'&&<div className="panel"><div className="section-head"><h2>{t('history')}</h2><strong className="accent-text">{stats.focusMinutes} {t('minutes')}</strong></div><p className="muted history-caption">{t('days'+stats.trend.length)}</p><div className="history-list">{[...sessions.values()].sort((a,b)=>b.date.localeCompare(a.date)||b.timestamp-a.timestamp).map(session=><div key={JSON.stringify([session.subjectId||session.subject,session.date])}><span className="emoji-tile small"><EntityIcon value={session.emoji} size={18}/></span><div className="row-main"><strong>{session.subject}</strong><span className="row-meta">{dateLabel(session.date,language)}</span></div><strong className="history-duration">{formatClock(session.seconds)}</strong></div>)}{!stats.sessions.length&&<HistoryEmpty icon={Clock} text={t('emptySessions')}/>}</div></div>}
 </section>;
}

const HistoryEmpty=({icon:Icon,text})=><div className="empty"><Icon size={24}/><p>{text}</p></div>;
