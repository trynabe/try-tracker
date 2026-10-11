import React from 'react';
import {ChevronDown} from 'lucide-react';
import {dayNames} from './i18n';

const days=[1,2,3,4,5,6,0];

export default function DaySelect({value,onChange,language,t}){
 const selected=days.includes(Number(value))?Number(value):0;
 return <span className="native-select-field">
  <select name="day" aria-label={t('day')} value={selected} onChange={onChange}>{days.map(day=><option key={day} value={day}>{dayNames[language][day]}</option>)}</select>
  <span className="native-select-value" aria-hidden="true">{dayNames[language][selected]}</span>
  <ChevronDown size={16} aria-hidden="true"/>
 </span>;
}
