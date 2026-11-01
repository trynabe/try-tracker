import {safeAccent} from './accent.js';

const rgb=hex=>[1,3,5].map(index=>parseInt(hex.slice(index,index+2),16));
const luminance=channels=>channels.map(channel=>{const value=channel/255;return value<=.04045?value/12.92:((value+.055)/1.055)**2.4;}).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);
const contrast=(a,b)=>(Math.max(a,b)+.05)/(Math.min(a,b)+.05);

// Preserve the chosen accent; adjust its text color only when the surface needs more contrast.
export function desktopAccentInk(accent,theme){
 const color=rgb(safeAccent(accent)||'#6255e7');
 const dark=theme==='dark',surface=rgb(dark?'#1b1e25':'#ffffff'),ink=rgb(dark?'#f1f3f8':'#202633');
 const surfaceLuminance=luminance(surface);
 for(let step=0;step<=20;step++){
  const mixed=color.map((channel,index)=>Math.round(channel+(ink[index]-channel)*step/20));
  if(contrast(luminance(mixed),surfaceLuminance)>=5||step===20)return '#'+mixed.map(channel=>channel.toString(16).padStart(2,'0')).join('');
 }
}
