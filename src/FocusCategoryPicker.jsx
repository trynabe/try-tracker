import React from 'react';
import {Check,Play,Plus,Pencil,Trash2,Target} from 'lucide-react';
import {formatClock} from './domain';
import {EntityIcon} from './icons';
import {habitColor} from './habitVisuals';

export default function FocusCategoryPicker({subjects,sessions,timer,today,activeFocusSeconds,t,busy,Modal,onClose,onSelect,onEdit,onDelete,onAdd}){
 return <Modal title={t('selectFocusCategory')} onClose={onClose} footer={<button type="button" className="secondary" disabled={busy} onClick={onAdd}><Plus size={16}/>{t('addSubject')}</button>}>
  <div className="focus-picker-list">
   {subjects.map(subject=>{
    const selected=timer?.subjectId===subject.id&&timer.phase!=='break';
    const seconds=sessions.filter(session=>session.subjectId===subject.id&&session.date===today).reduce((sum,session)=>sum+session.durationSeconds,0)+(selected?activeFocusSeconds:0);
    return <div className={'focus-picker-row'+(selected?' is-selected':'')} key={subject.id} style={{'--item-color':habitColor(subject)}}>
     <button type="button" className="focus-picker-option" aria-pressed={selected} disabled={busy} onClick={()=>onSelect(subject)}>
      <span className="focus-picker-icon"><EntityIcon value={subject.emoji} size={22}/></span>
      <span className="focus-picker-name"><strong>{subject.name}</strong><small>{t('today')} · {formatClock(seconds)}</small></span>
      {selected?<Check size={18}/>:<Play size={18}/>}
     </button>
     <div className="focus-picker-tools">
      <button type="button" className="icon-btn" aria-label={t('edit')+': '+subject.name} disabled={busy||selected} onClick={()=>onEdit(subject)}><Pencil size={17}/></button>
      <button type="button" className="icon-btn" aria-label={t('delete')+': '+subject.name} disabled={busy} onClick={()=>onDelete(subject)}><Trash2 size={17}/></button>
     </div>
    </div>;
   })}
   {!subjects.length&&<div className="empty"><Target size={28}/><p>{t('emptySubjects')}</p></div>}
  </div>
 </Modal>;
}
