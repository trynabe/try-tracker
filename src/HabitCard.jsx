import React from 'react';
import {Plus,Check,Flame,Target,Pencil,Trash2,RotateCcw,Trophy} from 'lucide-react';
import {EntityIcon} from './icons';
import {dateKey,dueHabit,habitDone,habitValue,streak} from './domain';
import {habitColor} from './habitVisuals';
import HabitHistoryGrid from './HabitHistoryGrid';

export default function HabitCard({habit,today,date=today,t,language='th',page,busy,changeHabit,openEditor,remove,onSelectDate,showHistory=false}){
 const value=habitValue(habit,date),done=habitDone(habit,date),record=streak(habit,today);
 const unavailable=date>today||date<dateKey(habit.createdAt)||!dueHabit(habit,date);
 return <article className={'habit-card '+(done?'is-done':'')} style={{'--habit-color':habitColor(habit)}}>
  <div className="habit-card-head">
   <span className="habit-card-icon"><EntityIcon value={habit.emoji} size={25}/></span>
   <div className="habit-card-title"><h3>{habit.name}</h3><p>{value} / {habit.target} {habit.unit||t('times')}{habit.description&&<span> · {habit.description}</span>}</p></div>
   <button className={'habit-complete '+(done?'checked':'')} disabled={busy||unavailable} aria-label={(done?t('undo'):t('finish'))+': '+habit.name} title={unavailable?t('habitUnavailable'):undefined} onClick={()=>changeHabit(habit,date,done?0:Math.min(habit.target,value+1))}>{done?<Check size={21}/>:<Plus size={21}/>}</button>
  </div>
  {showHistory&&<HabitHistoryGrid {...{habit,today,date,t,language,busy,onSelectDate}}/>}
  <footer className="habit-card-footer"><div className="habit-chips">{showHistory&&<><span title={t('streak')}><Flame size={13}/>{record.current} {t('streak')}</span><span title={t('bestStreak')}><Trophy size={13}/>{t('bestStreak')}: {record.best}</span></>}<span><Target size={13}/>{habit.days?.length?habit.days.length+' / '+t('weekly'):t('daily')}</span></div><div className="habit-card-tools">
   {habit.target>1&&<button className="icon-btn" aria-label={t('undo')+': '+habit.name} title={t('undo')} disabled={busy||unavailable||value===0} onClick={()=>changeHabit(habit,date,0)}><RotateCcw size={16}/></button>}
   {(page==='habits'||page==='today')&&<><button className="icon-btn" aria-label={t('edit')+': '+habit.name} title={t('edit')} disabled={busy} onClick={()=>openEditor('habits',habit)}><Pencil size={16}/></button><button className="icon-btn" aria-label={t('delete')+': '+habit.name} title={t('delete')} disabled={busy} onClick={()=>remove('habits',habit)}><Trash2 size={16}/></button></>}
  </div></footer>
 </article>;
}
