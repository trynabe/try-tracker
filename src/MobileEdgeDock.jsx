import React,{useEffect,useId,useRef,useState} from 'react';
import {Plus} from 'lucide-react';
import {edgeGestureIntent,edgeGestureProgress,settleEdgeGesture} from './edgeDockGesture.js';
import './mobileEdgeDock.css';

export default function MobileEdgeDock({nav,page,t,taskCount,busy,canAdd,addLabel,onNavigate,onAdd}){
 const [open,setOpen]=useState(false),[dragging,setDragging]=useState(false),[focused,setFocused]=useState(null);
 const root=useRef(null),handle=useRef(null),rail=useRef(null),stack=useRef(null),gesture=useRef(null),frame=useRef(0),progress=useRef(0),ignoredClick=useRef(null),previousFocus=useRef(null),navigationRef=useRef(null);
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
  const hasHorizontalScroll=target=>{
   for(let node=target;node&&node!==document.body;node=node.parentElement){
    if(node.scrollWidth>node.clientWidth+1&&/auto|scroll/.test(getComputedStyle(node).overflowX))return true;
   }
   return false;
  };
  const begin=(id,x,y,target,source)=>{
   if(gesture.current||!(target instanceof Element))return;
   if(target.closest('input,textarea,select,[contenteditable]:not([contenteditable=false]),[role=slider],[data-dock-gesture=ignore]'))return;
   if(document.querySelector('[role=dialog][aria-modal=true]:not(.mobile-edge-navigation)'))return;
   const startedOpen=current.current.open;
   if(startedOpen?!root.current?.contains(target):hasHorizontalScroll(target))return;
   // A rightward swipe opens the dock from anywhere on the page.
   gesture.current={id,source,x,y,at:performance.now(),startedOpen,target,locked:false};
  };
  const down=event=>{
   ignoredClick.current=null;
   if(event.pointerType==='touch'||!event.isPrimary||event.button!==0)return;
   begin(event.pointerId,event.clientX,event.clientY,event.target,'pointer');
  };
  const update=(x,y,event)=>{
   const drag=gesture.current;if(!drag)return;
   if(drag.ignoredDirection)return;
   const dx=x-drag.x,dy=y-drag.y;
   if(!drag.locked){
    const intent=edgeGestureIntent(dx,dy,drag.startedOpen);
    if(intent==='scroll'){gesture.current=null;return;}
    if(intent==='cancel'){drag.ignoredDirection=true;return;}
    if(intent!=='drag')return;
    drag.locked=true;setDragging(true);root.current?.setAttribute('data-dragging','true');
    if(drag.source==='pointer')try{drag.target.setPointerCapture(drag.id);}catch{}
   }
   if(event.cancelable)event.preventDefault();
   paint(edgeGestureProgress(dx,drag.startedOpen));
  };
  const complete=(x,cancelled)=>{
   const drag=gesture.current;if(!drag)return;
   if(!drag.locked){if(drag.ignoredDirection&&!cancelled)ignoredClick.current={until:performance.now()+500};gesture.current=null;return;}
   if(!cancelled)ignoredClick.current={until:performance.now()+500};
   const next=cancelled?drag.startedOpen:settleEdgeGesture(x-drag.x,performance.now()-drag.at,drag.startedOpen);
   if(drag.source==='pointer')try{if(drag.target.hasPointerCapture(drag.id))drag.target.releasePointerCapture(drag.id);}catch{}
   settle(next);
  };
  const move=event=>{if(gesture.current?.source==='pointer'&&event.pointerId===gesture.current.id)update(event.clientX,event.clientY,event);};
  const finish=event=>{if(gesture.current?.source==='pointer'&&event.pointerId===gesture.current.id)complete(event.clientX,event.type==='pointercancel');};
  const cancel=()=>{if(gesture.current?.locked)settle(gesture.current.startedOpen);else gesture.current=null;};
  // Touch move must be non-passive so a deliberate horizontal swipe can claim the
  // gesture without disabling native vertical scrolling, pinch zoom or date-strip scrolling.
  const touchStart=event=>{
   ignoredClick.current=null;
   if(event.touches.length!==1){cancel();return;}
   const touch=event.changedTouches[0];
   begin(touch.identifier,touch.clientX,touch.clientY,event.target,'touch');
  };
  const touchMove=event=>{
   if(gesture.current?.source!=='touch')return;
   if(event.touches.length!==1){cancel();return;}
   const touch=[...event.touches].find(touch=>touch.identifier===gesture.current.id);
   if(touch)update(touch.clientX,touch.clientY,event);
  };
  const touchEnd=event=>{
   if(gesture.current?.source!=='touch')return;
   const touch=[...event.changedTouches].find(touch=>touch.identifier===gesture.current.id);
   if(touch)complete(touch.clientX,event.type==='touchcancel');
  };
  const suppressClick=event=>{
   const ignored=ignoredClick.current;
   if(ignored&&event.detail!==0&&performance.now()<ignored.until){event.preventDefault();event.stopImmediatePropagation();ignoredClick.current=null;}
  };
  document.addEventListener('pointerdown',down,{passive:true});
  document.addEventListener('pointermove',move,{passive:false});
  document.addEventListener('pointerup',finish);
  document.addEventListener('pointercancel',finish);
  document.addEventListener('touchstart',touchStart,{passive:true});
  document.addEventListener('touchmove',touchMove,{passive:false});
  document.addEventListener('touchend',touchEnd);
  document.addEventListener('touchcancel',touchEnd);
  document.addEventListener('click',suppressClick,true);
  window.addEventListener('blur',cancel);
  return()=>{document.removeEventListener('pointerdown',down);document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',finish);document.removeEventListener('pointercancel',finish);document.removeEventListener('touchstart',touchStart);document.removeEventListener('touchmove',touchMove);document.removeEventListener('touchend',touchEnd);document.removeEventListener('touchcancel',touchEnd);document.removeEventListener('click',suppressClick,true);window.removeEventListener('blur',cancel);if(frame.current)cancelAnimationFrame(frame.current);};
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
   const items=[...stack.current.querySelectorAll('button:not(:disabled)')],index=items.indexOf(document.activeElement);
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
   <div className="mobile-edge-position" ref={stack}><nav className="mobile-edge-dock" ref={rail} id={id} aria-label={t('workspace')}>
    {nav.map(([key,Icon],index)=><React.Fragment key={key}><div className="mobile-edge-item"><button type="button" className={'mobile-edge-button'+(page===key?' active':'')} aria-label={t(key)+(key==='tasks'&&taskCount?' · '+taskCount:'')} title={t(key)} aria-current={page===key?'page':undefined} onFocus={()=>setFocused(key)} onBlur={()=>setFocused(null)} onClick={()=>navigate(key)}><Icon size={24} strokeWidth={1.7} aria-hidden="true"/>{key==='tasks'&&taskCount>0&&<span className="mobile-edge-count" aria-hidden="true">{taskCount>99?'99+':taskCount}</span>}</button></div>{index===3&&<span className="mobile-edge-divider" aria-hidden="true"/>}</React.Fragment>)}
   </nav>
   {canAdd&&<button type="button" className="mobile-edge-add" disabled={busy} aria-label={addLabel} title={addLabel} onClick={()=>{close();onAdd();}}><Plus size={22} aria-hidden="true"/></button>}
   <span className="mobile-edge-tooltip" aria-hidden="true">{focused?t(focused):''}</span></div>
  </div>
 </div>;
}
