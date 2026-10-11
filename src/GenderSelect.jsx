import React from 'react';
import {ChevronDown} from 'lucide-react';

const choices=[['male','genderMale'],['female','genderFemale'],['nonbinary','genderNonbinary'],['other','genderOther'],['preferNot','genderPreferNot']];

export default function GenderSelect({value,onChange,t}){
 const selected=choices.find(([key])=>key===value);
 return <span className="native-select-field">
  <select autoComplete="sex" aria-label={t('gender')} {...{value,onChange}}><option value="">{t('genderSelect')}</option>{choices.map(([key,label])=><option key={key} value={key}>{t(label)}</option>)}</select>
  <span className="native-select-value" aria-hidden="true">{t(selected?selected[1]:'genderSelect')}</span>
  <ChevronDown size={16} aria-hidden="true"/>
 </span>;
}
