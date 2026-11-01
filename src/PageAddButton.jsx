import React from 'react';
import {Plus} from 'lucide-react';
import './pageActions.css';

export default function PageAddButton({label,icon:Icon=Plus,premium=false,appearance='primary',className='',...props}){
 return <button type="button" className={'primary '+className+(premium?' page-add-button':'')} data-appearance={premium?appearance:undefined} {...props}>
  {premium?<><span className="page-add-icon" aria-hidden="true"><Icon size={18}/></span><span className="page-add-label">{label}</span></>:<><Icon size={18}/>{label}</>}
 </button>;
}
