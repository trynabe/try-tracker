import React,{useEffect,useId,useRef,useState} from 'react';
import {Camera,RotateCcw,Upload,UserRound} from 'lucide-react';
import {safeProfilePhoto} from './profile';
import {normalizeImageCrop,panImageCrop} from './imageCrop';
import ProfileImage from './ProfileImage';

export default function ProfileImageControl({kind,profile,t,busy,onSave,className,children,Modal}){
 const [open,setOpen]=useState(false),[draft,setDraft]=useState(''),[crop,setCrop]=useState(normalizeImageCrop),[loading,setLoading]=useState(false),[error,setError]=useState(''),[dragging,setDragging]=useState(false),[coverAspect,setCoverAspect]=useState(3);
 const input=useRef(),trigger=useRef(),request=useRef(0),live=useRef(false),drag=useRef(null),saving=useRef(busy),zoomId=useId(),hintId=useId();
 saving.current=busy;
 const cover=kind==='coverPhoto',disabled=busy||loading;
 useEffect(()=>{live.current=true;return()=>{live.current=false;request.current++;};},[]);
 useEffect(()=>{
  if(!open||!cover)return;const node=trigger.current.closest('.profile-cover'),measure=()=>setCoverAspect(node.clientWidth/node.clientHeight||3);measure();const observer=new ResizeObserver(measure);observer.observe(node);return()=>observer.disconnect();
 },[open,cover]);
 const dismiss=()=>{request.current++;drag.current=null;setDragging(false);setOpen(false);setLoading(false);};
 const close=()=>{if(!saving.current)dismiss();};
 async function selectImage(e){
  const file=e.target.files?.[0];e.target.value='';if(!file)return;const id=++request.current;setError('');
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){setError(t('photoInvalid'));return;}
  setLoading(true);let bitmap;
  try{bitmap=await createImageBitmap(file);const canvas=document.createElement('canvas'),scale=Math.min(1,(cover?1600:512)/Math.max(bitmap.width,bitmap.height));canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);let encoded=canvas.toDataURL('image/webp',.82);if(!safeProfilePhoto(encoded))encoded=canvas.toDataURL('image/webp',.6);if(!safeProfilePhoto(encoded))throw Error('image too large');if(live.current&&request.current===id){setDraft(encoded);setCrop(normalizeImageCrop());}}
  catch{if(live.current&&request.current===id)setError(t('photoError'));}
  finally{bitmap?.close();if(live.current&&request.current===id)setLoading(false);}
 }
 const startDrag=e=>{
  if(disabled||!e.isPrimary||e.button!==0)return;const node=e.currentTarget,image=node.querySelector('img');if(!image?.naturalWidth)return;
  drag.current={pointer:e.pointerId,startX:e.clientX,startY:e.clientY,crop,frameWidth:node.clientWidth,frameHeight:node.clientHeight,imageWidth:image.getBoundingClientRect().width,imageHeight:image.getBoundingClientRect().height};
  node.focus();node.setPointerCapture(e.pointerId);setDragging(true);e.preventDefault();
 };
 const moveDrag=e=>{const d=drag.current;if(!d||d.pointer!==e.pointerId||disabled)return;setCrop(panImageCrop(d.crop,e.clientX-d.startX,e.clientY-d.startY,d.imageWidth,d.imageHeight,d.frameWidth,d.frameHeight));};
 const endDrag=e=>{if(drag.current?.pointer!==e.pointerId)return;drag.current=null;setDragging(false);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);};
 const moveKey=e=>{if(disabled)return;const moves={ArrowLeft:['x',-.05],ArrowRight:['x',.05],ArrowUp:['y',-.05],ArrowDown:['y',.05]};if(e.key==='Home'){e.preventDefault();setCrop(normalizeImageCrop());}else if(moves[e.key]){e.preventDefault();const [axis,delta]=moves[e.key];setCrop(current=>normalizeImageCrop({...current,[axis]:current[axis]+delta}));}};
 const previewClass='profile-image-preview image-cropper '+(cover?'cover-crop-preview':'avatar-crop-preview')+(dragging?' dragging':'');
 return <><button ref={trigger} type="button" className={className} aria-label={t(cover?'editCoverPhoto':'editProfilePhoto')} disabled={busy} onClick={e=>{
  const node=e.currentTarget.closest('.profile-cover');if(cover&&node)setCoverAspect(node.clientWidth/node.clientHeight||3);
  setDraft(safeProfilePhoto(profile[kind]));setCrop(normalizeImageCrop(profile[kind+'Crop']));setError('');setOpen(true);
 }}>{children}</button>{open&&<Modal title={t(cover?'coverPhoto':'profilePhoto')} onClose={close} footer={<><button className="secondary" disabled={busy} onClick={close}>{t('cancel')}</button><button className="primary" disabled={disabled} onClick={async()=>{if(await onSave({[kind]:draft,[kind+'Crop']:normalizeImageCrop(crop)}))dismiss();}}>{busy?t('saving'):t('save')}</button></>}>
  {draft?<ProfileImage src={draft} crop={crop} alt={t('imagePreview')} className={previewClass} style={cover?{aspectRatio:coverAspect}:undefined} frameProps={{role:'group',tabIndex:disabled?-1:0,'aria-label':t('adjustImage'),'aria-describedby':hintId,'aria-disabled':disabled,onPointerDown:startDrag,onPointerMove:moveDrag,onPointerUp:endDrag,onPointerCancel:endDrag,onLostPointerCapture:()=>{drag.current=null;setDragging(false);},onKeyDown:moveKey}}/>:<div className={previewClass} style={cover?{aspectRatio:coverAspect}:undefined}>{cover?<Camera size={36}/>:<UserRound size={48}/>}</div>}
  {draft&&<div className="image-zoom-control"><div className="image-zoom-heading"><label htmlFor={zoomId}>{t('imageZoom')} <output>{Math.round(crop.zoom*100)}%</output></label><button type="button" className="text-btn image-crop-reset" disabled={disabled} onClick={()=>setCrop(normalizeImageCrop())}><RotateCcw size={14}/>{t('resetImageCrop')}</button></div><input id={zoomId} type="range" min="1" max="4" step=".01" value={crop.zoom} disabled={disabled} aria-valuetext={Math.round(crop.zoom*100)+'%'} onChange={e=>setCrop(current=>normalizeImageCrop({...current,zoom:Number(e.target.value)}))}/><p id={hintId} className="muted small-text">{t('imagePanHint')}</p></div>}
  <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={selectImage}/><div className="button-row"><button className="secondary" disabled={disabled} onClick={()=>input.current.click()}><Upload size={16}/>{loading?t('saving'):t('uploadPhoto')}</button>{draft&&<button className="text-btn danger" disabled={disabled} onClick={()=>{setDraft('');setCrop(normalizeImageCrop());}}>{t(cover?'removeCoverPhoto':'removePhoto')}</button>}</div><p className="muted small-text">{t('photoHint')}</p>{error&&<p className="form-error" role="alert">{error}</p>}
 </Modal>}</>;
}
