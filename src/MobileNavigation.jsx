import React from 'react';
import {Grid2X2,Plus} from 'lucide-react';

export default function MobileNavigation({tabs,nav,page,t,busy,canAdd,addLabel,onNavigate,onAdd,onMore,workspaceOpen}){
 const visibleTabs=[...new Set([...tabs,...nav.map(([key])=>key)])].filter(key=>nav.some(([id])=>id===key)).slice(0,3);
 const renderItem=key=>{
  const more=key==='more';
  const Icon=more?Grid2X2:nav.find(([id])=>id===key)[1];
  const active=more?(workspaceOpen||!visibleTabs.includes(page)):page===key;
  return <button key={key} type="button" className={active?'active':''} aria-label={t(key)} title={t(key)} aria-current={!more&&active?'page':undefined} aria-expanded={more?workspaceOpen:undefined} onClick={()=>more?onMore():onNavigate(key)}><Icon size={22} aria-hidden="true"/></button>;
 };
 return <nav className="mobile-tabbar" aria-label={t('bottomTabs')}>
  {visibleTabs.slice(0,2).map(renderItem)}
  <button className="mobile-nav-add" type="button" aria-label={addLabel} title={addLabel} disabled={busy||!canAdd} onClick={onAdd}><Plus size={23} aria-hidden="true"/></button>
  {visibleTabs.slice(2).map(renderItem)}
  {renderItem('more')}
 </nav>;
}
