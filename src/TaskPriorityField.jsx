import React from 'react';
import {Check} from 'lucide-react';

export default function TaskPriorityField({value,onChange,t}){
 return <fieldset className="task-priority-field"><legend>{t('priority')}</legend><div className="task-priority-options">
  {['low','medium','high'].map(priority=><label key={priority} className={'task-priority-option '+(value===priority?'selected':'')} data-priority={priority}>
   <input type="radio" name="priority" value={priority} checked={value===priority} onChange={()=>onChange(priority)}/>
   <i aria-hidden="true"/><span>{t(priority)}</span>{value===priority&&<Check size={15} aria-hidden="true"/>}
  </label>)}
 </div></fieldset>;
}
