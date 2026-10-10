import React,{useLayoutEffect,useRef,useState} from 'react';
import {imageCropGeometry} from './imageCrop';
import './profileImage.css';

export default function ProfileImage({src,crop,alt='',className='',style,frameProps={}}){
 const frame=useRef(),[size,setSize]=useState({width:0,height:0}),[image,setImage]=useState(null);
 useLayoutEffect(()=>{
  const node=frame.current,measure=()=>setSize(previous=>{const width=node.clientWidth,height=node.clientHeight;return previous.width===width&&previous.height===height?previous:{width,height};});
  measure();const observer=new ResizeObserver(measure);observer.observe(node);return()=>observer.disconnect();
 },[]);
 const geometry=image?.src===src?imageCropGeometry(image.width,image.height,size.width,size.height,crop):null;
 return <span {...frameProps} ref={frame} className={'profile-image-frame '+className} style={style}>
  <img src={src} alt={alt} draggable="false" onLoad={e=>setImage({src,width:e.currentTarget.naturalWidth,height:e.currentTarget.naturalHeight})} style={geometry?{width:geometry.width,height:geometry.height,left:geometry.left,top:geometry.top}:undefined}/>
 </span>;
}
