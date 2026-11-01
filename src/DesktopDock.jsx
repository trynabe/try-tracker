import React,{useId,useState} from 'react';

export default function DesktopDock({nav,page,t,onNavigate,taskCount,score,level}){
 const tooltipId=useId();
 const [dismissed,setDismissed]=useState(null);
 const item=({key,label,children,badge,detail})=><div className="dock-item" key={key} data-tooltip-hidden={dismissed===key||undefined} onMouseEnter={()=>setDismissed(null)}>
  <button type="button" className={'dock-button '+(page===key?'active':'')} aria-label={label} title={label+(detail?' — '+detail:'')} aria-current={page===key?'page':undefined} aria-describedby={tooltipId+'-'+key} onFocus={()=>setDismissed(null)} onClick={()=>{setDismissed(key);onNavigate(key);}} onKeyDown={event=>{if(event.key==='Escape'){setDismissed(key);event.stopPropagation();}}}>
   {children}
   {!!badge&&<span className="dock-count" aria-hidden="true">{badge>99?'99+':badge}</span>}
  </button>
  <span className="dock-tooltip" id={tooltipId+'-'+key} role="tooltip"><strong>{label}</strong>{detail&&<small>{detail}</small>}</span>
 </div>;
 return <aside className="desktop-dock" aria-label="Try-Tracker">
  <nav className="dock-navigation" aria-label={t('workspace')}>
   {nav.map(([key,Icon],index)=><React.Fragment key={key}>
    {item({key,label:t(key)+(key==='tasks'&&taskCount?' · '+taskCount:''),badge:key==='tasks'?taskCount:0,detail:key==='insights'?t('score')+' '+score+'/100 · '+level:undefined,children:<Icon size={22} strokeWidth={1.7} aria-hidden="true"/>})}
    {index===3&&<span className="dock-divider" aria-hidden="true"/>}
   </React.Fragment>)}
  </nav>
 </aside>;
}
