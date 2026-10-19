import React,{useEffect,useId,useRef,useState} from 'react';
import {Check,ChevronDown} from 'lucide-react';

export default function NotesSelect({label,value,options,onChange,className=''}){
 const [open,setOpen]=useState(false),[active,setActive]=useState(0);
 const root=useRef(null),trigger=useRef(null),optionRefs=useRef([]),id=useId(),typed=useRef({value:'',time:0});
 const selected=options.findIndex(option=>option.value===value),current=options[selected]||options[0];
 const show=()=>{setActive(Math.max(0,selected));setOpen(true);};
 const choose=index=>{if(!options[index])return;onChange(options[index].value);setOpen(false);trigger.current?.focus();};
 useEffect(()=>{if(!open)return;const dismiss=event=>{if(!root.current?.contains(event.target))setOpen(false);};document.addEventListener('pointerdown',dismiss,true);return()=>document.removeEventListener('pointerdown',dismiss,true);},[open]);
 useEffect(()=>{if(open)optionRefs.current[active]?.scrollIntoView({block:'nearest'});},[open,active]);
 const keys=event=>{
  if(event.key==='Tab'){setOpen(false);return;}
  if(event.key==='Escape'&&open){event.preventDefault();event.stopPropagation();setOpen(false);return;}
  if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
   event.preventDefault();
   if(!open){show();if(event.key==='Home')setActive(0);if(event.key==='End')setActive(options.length-1);return;}
   setActive(index=>event.key==='Home'?0:event.key==='End'?options.length-1:(index+(event.key==='ArrowDown'?1:-1)+options.length)%options.length);return;
  }
  if(event.key==='Enter'||event.key===' '){event.preventDefault();if(open)choose(active);else show();return;}
  if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey){
   const now=Date.now(),text=(now-typed.current.time<700?typed.current.value:'')+event.key.toLocaleLowerCase();typed.current={value:text,time:now};
   const index=options.findIndex(option=>option.label.toLocaleLowerCase().startsWith(text));if(index>=0){event.preventDefault();setOpen(true);setActive(index);}
  }
 };
 return <div ref={root} className={'notes-select '+className} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setOpen(false);}}>
  <button ref={trigger} type="button" className={'notes-select-trigger '+(open?'open':'')} role="combobox" aria-label={label} aria-haspopup="listbox" aria-expanded={open} aria-controls={id} aria-activedescendant={open?id+'-'+active:undefined} onKeyDown={keys} onClick={event=>{event.stopPropagation();if(open)setOpen(false);else show();}}><span>{current?.label}</span><ChevronDown size={15} aria-hidden="true"/></button>
  {open&&<div id={id} className="notes-select-menu" role="listbox" aria-label={label}>{options.map((option,index)=><button key={option.value} id={id+'-'+index} ref={node=>{optionRefs.current[index]=node;}} type="button" role="option" aria-selected={option.value===value} tabIndex={-1} className={(index===active?'active ':'')+(option.value===value?'selected':'')} onPointerMove={()=>setActive(index)} onMouseDown={event=>event.preventDefault()} onClick={event=>{event.preventDefault();event.stopPropagation();choose(index);}}><span>{option.label}</span>{option.value===value&&<Check size={15} aria-hidden="true"/>}</button>)}</div>}
 </div>;
}
