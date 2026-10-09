import React,{useMemo,useRef} from 'react';
import {Plus,Check,Flame,Target,Pencil,Trash2,RotateCcw,Trophy} from 'lucide-react';
import {EntityIcon} from './icons';
import {habitDone,habitValue,streak} from './domain';
import {habitColor,habitHistory} from './habitVisuals';

export default function HabitCard({habit,today,date=today,t,language='th',page,busy,changeHabit,openEditor,remove,onSelectDate}){
 const value=habitValue(habit,date),done=habitDone(habit,date),record=streak(habit,today);
 const cells=useMemo(()=>habitHistory(habit,today).map(cell=>({...cell,label:new Date(cell.date+'T12:00:00').toLocaleDateString(language==='th'?'th-TH':'en-US',{day:'numeric',month:'short',year:'numeric'})})),[habit,today,language]),refs=useRef([]);
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
 return <article className={'habit-card '+(done?'is-done':'')} style={{'--habit-color':habitColor(habit)}}>
  <div className="habit-card-head">
   <span className="habit-card-icon"><EntityIcon value={habit.emoji} size={25}/></span>
   <div className="habit-card-title"><h3>{habit.name}</h3><p>{value} / {habit.target} {habit.unit||t('times')}{habit.description&&<span> · {habit.description}</span>}</p></div>
   <button className={'habit-complete '+(done?'checked':'')} disabled={busy||date>today} aria-label={(done?t('undo'):t('finish'))+': '+habit.name} onClick={()=>changeHabit(habit,date,done?0:Math.min(habit.target,value+1))}>{done?<Check size={21}/>:<Plus size={21}/>}</button>
  </div>
  <div className="habit-history" aria-label={t('habitHistory')}>
   <div className="history-months" aria-hidden="true">{months.map((month,index)=>{const span=(months[index+1]?.column??20)-month.column;if(index===0&&span<2)return null;return <span key={month.date} style={{gridColumn:Math.min(month.column+1,19)+' / span '+Math.max(2,span)}}>{new Date(month.date+'T12:00:00').toLocaleDateString(language==='th'?'th-TH':'en-US',{month:'short'})}</span>;})}</div>
   <div className="history-grid-wrap"><div className="history-weekdays" aria-hidden="true"><span>{language==='th'?'จ.':'M'}</span><span>{language==='th'?'พ.':'W'}</span><span>{language==='th'?'ศ.':'F'}</span><span>{language==='th'?'อา.':'S'}</span></div>
    <div className="habit-history-grid" role="group" aria-label={t('habitHistory')}>
     {cells.map((cell,index)=><button key={cell.date} ref={node=>{refs.current[index]=node;}} type="button" className={'history-tile '+(cell.date===today?'is-today ':'')+(cell.date===date?'is-selected':'')} data-level={cell.level} disabled={!cell.available||busy} tabIndex={index===tabIndex?0:-1} aria-label={cell.label+': '+cell.value+' / '+habit.target+' '+habit.unit} aria-pressed={cell.date===date} title={cell.label+' · '+cell.value+'/'+habit.target+' '+habit.unit} onKeyDown={event=>move(event,index)} onClick={()=>onSelectDate?.(cell.date)}/>)}</div>
   </div>
  </div>
  <footer className="habit-card-footer"><div className="habit-chips"><span title={t('streak')}><Flame size={13}/>{record.current}</span><span title={t('bestStreak')}><Trophy size={13}/>{record.best}</span><span><Target size={13}/>{habit.days?.length?habit.days.length+' / '+t('weekly'):t('daily')}</span></div><div className="habit-card-tools">
   {habit.target>1&&<button className="icon-btn" aria-label={t('undo')+': '+habit.name} title={t('undo')} disabled={busy||date>today||value===0} onClick={()=>changeHabit(habit,date,0)}><RotateCcw size={16}/></button>}
   {page==='habits'&&<><button className="icon-btn" aria-label={t('edit')+': '+habit.name} title={t('edit')} disabled={busy} onClick={()=>openEditor('habits',habit)}><Pencil size={16}/></button><button className="icon-btn" aria-label={t('delete')+': '+habit.name} title={t('delete')} disabled={busy} onClick={()=>remove('habits',habit)}><Trash2 size={16}/></button></>}
  </div></footer>
 </article>;
}
