import React,{useEffect,useId,useRef,useState} from 'react';
import {Grid2X2,Plus,X} from 'lucide-react';
import {navigationTabs} from './navigationTabs';
import './mobileNavigation.css';

export default function MobileNavigation({tabs,nav,page,t,busy,canAdd,addLabel,onNavigate,onAdd}){
 const [menuPhase,setMenuPhase]=useState('closed');
 const moreOpen=menuPhase==='open',menuVisible=menuPhase!=='closed';
 const moreRef=useRef(null),menuRef=useRef(null),menuId=useId();
 const {visible:visibleTabs,overflow}=navigationTabs(tabs,nav);
 const closeMenu=()=>setMenuPhase(phase=>phase==='open'?'closing':phase);
 const navigate=key=>{closeMenu();onNavigate(key);};
 useEffect(()=>setMenuPhase(phase=>phase==='open'?'closing':phase),[page]);
 useEffect(()=>{
  if(menuPhase!=='closing')return;
  if(matchMedia('(prefers-reduced-motion:reduce)').matches||!matchMedia('(max-width:700px)').matches){setMenuPhase('closed');return;}
  const timeout=setTimeout(()=>setMenuPhase(phase=>phase==='closing'?'closed':phase),480+Math.max(0,overflow.length-1)*45+50);
  return()=>clearTimeout(timeout);
 },[menuPhase,overflow.length]);
 useEffect(()=>{
  const media=matchMedia('(max-width:700px)');
  const closeOnDesktop=()=>{if(!media.matches)setMenuPhase('closed');};
  media.addEventListener('change',closeOnDesktop);
  return()=>media.removeEventListener('change',closeOnDesktop);
 },[]);
 useEffect(()=>{
  if(!moreOpen)return;
  const menu=menuRef.current;
  menu?.querySelector('button')?.focus();
  const dismiss=e=>{if(e.key==='Escape'){e.preventDefault();setMenuPhase(phase=>phase==='open'?'closing':phase);}};
  document.addEventListener('keydown',dismiss);
  return()=>{document.removeEventListener('keydown',dismiss);if(menu?.contains(document.activeElement)||document.activeElement===document.body)moreRef.current?.focus();};
 },[moreOpen]);
 const menuKeys=e=>{
  const items=[...menuRef.current.querySelectorAll('button')];
  const current=items.indexOf(document.activeElement);
  const next={ArrowDown:(current+1)%items.length,ArrowUp:(current-1+items.length)%items.length,Home:0,End:items.length-1}[e.key];
  if(next!==undefined){e.preventDefault();items[next]?.focus();}
  if(e.key==='Tab')closeMenu();
 };
 const renderItem=key=>{
  const more=key==='more';
  const Icon=more?(moreOpen?X:Grid2X2):nav.find(([id])=>id===key)[1];
  const active=more?(moreOpen||!visibleTabs.includes(page)):page===key;
  return <button ref={more?moreRef:undefined} key={key} type="button" className={(active?'active ':'')+(more&&moreOpen?'mobile-more-open':'')} aria-label={t(key)} title={t(key)} aria-current={!more&&active?'page':undefined} aria-expanded={more?moreOpen:undefined} aria-haspopup={more?'menu':undefined} aria-controls={more&&menuVisible?menuId:undefined} onClick={()=>more?setMenuPhase(phase=>phase==='open'?'closing':'open'):navigate(key)}><Icon size={22} aria-hidden="true"/></button>;
 };
 const overflowMenu=menuVisible&&<div className={'mobile-more-menu '+(menuPhase==='closing'?'closing':'')} id={menuId} ref={menuRef} role="menu" aria-label={t('more')} aria-hidden={!moreOpen} inert={!moreOpen?true:undefined} onKeyDown={menuKeys} onAnimationEnd={e=>{if(menuPhase==='closing'&&e.animationName==='mobile-more-return'&&e.target===e.currentTarget.lastElementChild)setMenuPhase(phase=>phase==='closing'?'closed':phase);}}>{overflow.map((key,index)=>{const Icon=nav.find(([id])=>id===key)[1];return <button type="button" role="menuitem" key={key} aria-label={t(key)} title={t(key)} className={page===key?'active':''} aria-current={page===key?'page':undefined} style={{'--menu-delay':(overflow.length-index-1)*45+'ms','--menu-close-delay':index*45+'ms'}} onClick={()=>navigate(key)}><Icon size={23} aria-hidden="true"/></button>;})}</div>;
 return <>
  {menuVisible&&<button className={'mobile-more-backdrop '+(menuPhase==='closing'?'closing':'')} type="button" tabIndex={-1} aria-label={t('closeMenu')} aria-hidden={!moreOpen} onClick={closeMenu}/>}
  <nav className="mobile-tabbar" aria-label={t('bottomTabs')}>
  {visibleTabs.slice(0,2).map(renderItem)}
  <button className="mobile-nav-add" type="button" aria-label={addLabel} title={addLabel} disabled={busy||!canAdd} onClick={()=>{closeMenu();onAdd();}}><Plus size={23} aria-hidden="true"/></button>
  {visibleTabs.slice(2).map(renderItem)}
  <div className="mobile-more-anchor">{renderItem('more')}{overflowMenu}</div>
  </nav>
 </>;
}
