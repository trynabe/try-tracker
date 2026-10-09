import React,{useMemo,useRef} from 'react';
import {habitHistory} from './habitVisuals';

export default function HabitHistoryGrid({habit,today,date,t,language,busy,onSelectDate}){
 const cells=useMemo(()=>habitHistory(habit,today).map(cell=>({...cell,label:new Date(cell.date+'T12:00:00').toLocaleDateString(language==='th'?'th-TH':'en-US',{day:'numeric',month:'short',year:'numeric'})})),[habit,today,language]);
 const refs=useRef([]);
 const months=useMemo(()=>cells.filter((_,index)=>index%7===0).map((cell,column)=>({date:cell.date,column})).filter((month,index,all)=>index===0||month.date.slice(0,7)!==all[index-1].date.slice(0,7)),[cells]);
 const selected=cells.findIndex(cell=>cell.date===date&&cell.available);
 const tabIndex=selected>=0?selected:cells.findLastIndex(cell=>cell.available);
 const move=(event,index)=>{
  const step={ArrowLeft:-7,ArrowRight:7,ArrowUp:-1,ArrowDown:1}[event.key];
  if(step===undefined)return;
  event.preventDefault();let next=index+step;
  while(next>=0&&next<cells.length&&!cells[next].available)next+=step;
  refs.current[next]?.focus();
 };
 return <div className="habit-history" aria-label={t('habitHistory')}>
  <div className="history-months" aria-hidden="true">{months.map((month,index)=>{const span=(months[index+1]?.column??20)-month.column;if(index===0&&span<2)return null;return <span key={month.date} style={{gridColumn:Math.min(month.column+1,19)+' / span '+Math.max(2,span)}}>{new Date(month.date+'T12:00:00').toLocaleDateString(language==='th'?'th-TH':'en-US',{month:'short'})}</span>;})}</div>
  <div className="history-grid-wrap"><div className="history-weekdays" aria-hidden="true"><span>{language==='th'?'จ.':'M'}</span><span>{language==='th'?'พ.':'W'}</span><span>{language==='th'?'ศ.':'F'}</span><span>{language==='th'?'อา.':'S'}</span></div>
   <div className="habit-history-grid" role="group" aria-label={t('habitHistory')}>
    {cells.map((cell,index)=><button key={cell.date} ref={node=>{refs.current[index]=node;}} type="button" className={'history-tile '+(cell.date===today?'is-today ':'')+(cell.date===date?'is-selected':'')} data-level={cell.level} disabled={!cell.available||busy} tabIndex={index===tabIndex?0:-1} aria-label={cell.label+': '+cell.value+' / '+habit.target+' '+(habit.unit||t('times'))} aria-pressed={cell.date===date} title={cell.label+' · '+cell.value+'/'+habit.target+' '+(habit.unit||t('times'))} onKeyDown={event=>move(event,index)} onClick={()=>onSelectDate(cell.date)}/>)}</div>
  </div>
 </div>;
}
