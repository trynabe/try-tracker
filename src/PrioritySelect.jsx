import React from 'react';
import {ChevronDown} from 'lucide-react';

const priorities=['low','medium','high'];

export default function PrioritySelect({value,onChange,t}){
 const selected=priorities.includes(value)?value:'low';
 return <span className="native-select-field">
  <select name="priority" aria-label={t('priority')} value={selected} onChange={onChange}>{priorities.map(priority=><option key={priority} value={priority}>{t(priority)}</option>)}</select>
  <span className="native-select-value" aria-hidden="true">{t(selected)}</span>
  <ChevronDown size={16} aria-hidden="true"/>
 </span>;
}
