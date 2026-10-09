import React,{useEffect,useRef,useState} from 'react';
import {Grid2X2,Plus} from 'lucide-react';

export default function MobileNavigation({tabs,nav,page,t,busy,onNavigate,onAddTask,onMore,workspaceOpen}){
 const ref=useRef(null);
 const [width,setWidth]=useState(0);
 useEffect(()=>{
  const node=ref.current;
  const measure=()=>setWidth(node.getBoundingClientRect().width);
  measure();
  const observer=new ResizeObserver(measure);
  observer.observe(node);
  return()=>observer.disconnect();
 },[]);
 // Reserve a 44px touch target for every shortcut on either side of Add.
 const visibleTabs=[...new Set(tabs)].filter(key=>nav.some(([id])=>id===key)).slice(0,width>=354?5:3);
 const items=[...visibleTabs,'more'];
 const midpoint=Math.floor(items.length/2);
 const renderItem=key=>{
  const more=key==='more';
  const Icon=more?Grid2X2:nav.find(([id])=>id===key)[1];
  const active=more?(workspaceOpen||!visibleTabs.includes(page)):page===key;
  return <button key={key} type="button" className={active?'active':''} aria-label={t(key)} title={t(key)} aria-current={!more&&active?'page':undefined} aria-expanded={more?workspaceOpen:undefined} onClick={()=>more?onMore():onNavigate(key)}><Icon size={22} aria-hidden="true"/></button>;
 };
 return <nav ref={ref} className="mobile-tabbar" aria-label={t('bottomTabs')}>
  <div className="mobile-nav-side">{items.slice(0,midpoint).map(renderItem)}</div>
  <button className="mobile-nav-add-task" type="button" aria-label={t('addTask')} title={t('addTask')} disabled={busy} onClick={onAddTask}><Plus size={28} aria-hidden="true"/></button>
  <div className="mobile-nav-side">{items.slice(midpoint).map(renderItem)}</div>
 </nav>;
}
