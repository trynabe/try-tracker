import React,{useEffect,useId,useRef,useState} from 'react';
import {Plus} from 'lucide-react';
import {EDGE_DOCK_WIDTH,edgeGestureIntent,edgeGestureProgress,settleEdgeGesture} from './edgeDockGesture.js';
import './mobileEdgeDock.css';

export default function MobileEdgeDock({nav,page,t,taskCount,busy,canAdd,addLabel,onNavigate,onAdd}){
 const [open,setOpen]=useState(false),[dragging,setDragging]=useState(false),[focused,setFocused]=useState(null);
 const root=useRef(null),handle=useRef(null),rail=useRef(null),gesture=useRef(null),frame=useRef(0),progress=useRef(0),ignoredClick=useRef(null),previousFocus=useRef(null),navigationRef=useRef(null);
 const id=useId(),engaged=open||dragging;
 const current=useRef({open,page,engaged});current.current={open,page,engaged};
 navigationRef.current=onNavigate;

 const paint=value=>{
  progress.current=value;
  if(frame.current)return;
  frame.current=requestAnimationFrame(()=>{frame.current=0;root.current?.style.setProperty('--edge-progress',String(progress.current));});
 };
 const settle=next=>{
  if(frame.current)cancelAnimationFrame(frame.current);frame.current=0;
  gesture.current=null;
  root.current?.removeAttribute('data-dragging');
  root.current?.style.setProperty('--edge-progress',next?'1':'0');
  progress.current=next?1:0;
  current.current.open=next;
  setDragging(false);setOpen(next);
 };
 const close=()=>settle(false);
 const toggle=()=>settle(!current.current.open);

 useEffect(()=>{
  const down=event=>{
   ignoredClick.current=null;
   if(!event.isPrimary||event.button!==0||gesture.current)return;
   const target=event.target;
   if(!(target instanceof Element)||target.closest('input,textarea,select,[contenteditable=true]'))return;
   if(document.querySelector('[role=dialog][aria-modal=true]:not(.mobile-edge-navigation)'))return;
   const startedOpen=current.current.open;
   if(startedOpen?!root.current?.contains(target):event.clientX>EDGE_DOCK_WIDTH)return;
   gesture.current={pointerId:event.pointerId,x:event.clientX,y:event.clientY,at:performance.now(),startedOpen,target,locked:false};
  };
  const move=event=>{
   const drag=gesture.current;if(!drag||event.pointerId!==drag.pointerId)return;
   const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
   if(!drag.locked){
    const intent=edgeGestureIntent(dx,dy,drag.startedOpen);
    if(intent==='scroll'||intent==='cancel'){gesture.current=null;return;}
    if(intent!=='drag')return;
    drag.locked=true;setDragging(true);root.current?.setAttribute('data-dragging','true');
    try{drag.target.setPointerCapture(event.pointerId);}catch{}
   }
   if(event.cancelable)event.preventDefault();
   paint(edgeGestureProgress(dx,drag.startedOpen));
  };
  const finish=event=>{
   const drag=gesture.current;if(!drag||event.pointerId!==drag.pointerId)return;
   if(!drag.locked){gesture.current=null;return;}
   if(event.type==='pointerup')ignoredClick.current={until:performance.now()+500};
   const next=event.type==='pointercancel'?drag.startedOpen:settleEdgeGesture(event.clientX-drag.x,performance.now()-drag.at,drag.startedOpen);
   try{if(drag.target.hasPointerCapture(event.pointerId))drag.target.releasePointerCapture(event.pointerId);}catch{}
   settle(next);
  };
  const cancel=()=>{if(gesture.current?.locked)settle(gesture.current.startedOpen);else gesture.current=null;};
  const suppressClick=event=>{
   const ignored=ignoredClick.current;
   if(ignored&&event.detail!==0&&performance.now()<ignored.until){event.preventDefault();event.stopImmediatePropagation();ignoredClick.current=null;}
  };
  document.addEventListener('pointerdown',down,{passive:true});
  document.addEventListener('pointermove',move,{passive:false});
  document.addEventListener('pointerup',finish);
  document.addEventListener('pointercancel',finish);
  document.addEventListener('click',suppressClick,true);
  window.addEventListener('blur',cancel);
  return()=>{document.removeEventListener('pointerdown',down);document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',finish);document.removeEventListener('pointercancel',finish);document.removeEventListener('click',suppressClick,true);window.removeEventListener('blur',cancel);if(frame.current)cancelAnimationFrame(frame.current);};
 },[]);

 useEffect(()=>{close();},[page]);
 useEffect(()=>{
  if(!engaged)return;
  previousFocus.current=document.activeElement;
  const siblings=[...root.current.parentElement.children].filter(node=>node!==root.current).map(node=>({node,inert:node.inert}));
  const overflow=document.body.style.overflow;
  siblings.forEach(({node})=>{node.inert=true;});document.body.style.overflow='hidden';
  return()=>{siblings.forEach(({node,inert})=>{node.inert=inert;});document.body.style.overflow=overflow;const previous=previousFocus.current;if(document.activeElement===document.body||root.current?.contains(document.activeElement))((previous?.isConnected&&!previous.closest('.mobile-edge-navigation'))?previous:handle.current)?.focus({preventScroll:true});};
 },[engaged]);
 useEffect(()=>{
  if(!open)return;
  const focusFrame=requestAnimationFrame(()=>{
   const menu=rail.current,button=menu?.querySelector('[aria-current=page],button');
   if(!button)return;
   button.focus({preventScroll:true});
   const item=button.getBoundingClientRect(),bounds=menu.getBoundingClientRect();
   if(item.top<bounds.top+8)menu.scrollTop-=bounds.top+8-item.top;
   else if(item.bottom>bounds.bottom-8)menu.scrollTop+=item.bottom-bounds.bottom+8;
  });
  const keys=event=>{
   if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();return;}
   const items=[...rail.current.querySelectorAll('button')],index=items.indexOf(document.activeElement);
   if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
    event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?items.length-1:index<0?(event.key==='ArrowDown'?0:items.length-1):(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;items[next]?.focus();
   }
   if(event.key==='Tab'){
    const focusable=[handle.current,...items],position=focusable.indexOf(document.activeElement);
    if(event.shiftKey&&position<=0){event.preventDefault();focusable.at(-1)?.focus();}
    else if(!event.shiftKey&&position===focusable.length-1){event.preventDefault();focusable[0]?.focus();}
   }
  };
  document.addEventListener('keydown',keys,true);
  return()=>{cancelAnimationFrame(focusFrame);document.removeEventListener('keydown',keys,true);};
 },[open]);

 const navigate=key=>{close();navigationRef.current(key);};
 return <div className="mobile-edge-navigation" ref={root} data-open={open||undefined} data-engaged={engaged||undefined} data-dragging={dragging||undefined} role={engaged?'dialog':undefined} aria-modal={engaged?true:undefined} aria-label={engaged?t('mobileDockLabel'):undefined}>
  <div className="mobile-edge-swipe-zone" aria-hidden="true"/>
  <button type="button" className="mobile-edge-trigger" ref={handle} aria-label={t(open?'closeMenu':'mobileDockOpen')} aria-expanded={open} aria-controls={id} onClick={toggle}>{t(open?'closeMenu':'mobileDockLabel')}</button>
  <div className="mobile-edge-overlay" aria-hidden={!open} inert={!open?true:undefined}>
   <button type="button" className="mobile-edge-scrim" tabIndex={-1} aria-label={t('closeMenu')} onClick={close}/>
   <div className="mobile-edge-position"><nav className="mobile-edge-dock" ref={rail} id={id} aria-label={t('workspace')}>
    {nav.map(([key,Icon],index)=><React.Fragment key={key}><div className="mobile-edge-item"><button type="button" className={'mobile-edge-button'+(page===key?' active':'')} aria-label={t(key)+(key==='tasks'&&taskCount?' · '+taskCount:'')} title={t(key)} aria-current={page===key?'page':undefined} onFocus={()=>setFocused(key)} onBlur={()=>setFocused(null)} onClick={()=>navigate(key)}><Icon size={24} strokeWidth={1.7} aria-hidden="true"/>{key==='tasks'&&taskCount>0&&<span className="mobile-edge-count" aria-hidden="true">{taskCount>99?'99+':taskCount}</span>}</button></div>{index===3&&<span className="mobile-edge-divider" aria-hidden="true"/>}</React.Fragment>)}
   </nav><span className="mobile-edge-tooltip" aria-hidden="true">{focused?t(focused):''}</span></div>
  </div>
  {!engaged&&canAdd&&<button type="button" className="mobile-edge-add" disabled={busy} aria-label={addLabel} title={addLabel} onClick={onAdd}><Plus size={25} aria-hidden="true"/></button>}
 </div>;
}
