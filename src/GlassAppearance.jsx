import React,{useId} from 'react';
import {Layers,Sparkles} from 'lucide-react';
import {MAX_GLASS_TRANSPARENCY} from './glassPreferences.js';

export default function GlassAppearance({enabled,transparency,busy,t,onChange,onPreview,onCommit}){
 const id=useId();
 return <div className="glass-setting" data-enabled={enabled}>
  <div className="glass-setting-heading">
   <span className="glass-setting-icon" aria-hidden="true"><Layers size={20}/></span>
   <div className="glass-setting-copy"><h3 id={id+'-label'}>Glassmorphism UI</h3><p id={id+'-description'}>{t('glassDescription')}</p></div>
   <button type="button" className="glass-switch" role="switch" aria-checked={enabled} aria-labelledby={id+'-label'} aria-describedby={id+'-description'} disabled={busy} onClick={()=>onChange(!enabled)}><span/></button>
  </div>
  <div className="glass-material-preview" aria-hidden="true">
   <div className="glass-preview-sheet glass-preview-back"><span/><i/><i/></div>
   <div className="glass-preview-sheet glass-preview-front"><span className="glass-preview-symbol"><Sparkles size={21}/></span><div><i/><i/></div><span className="glass-preview-dot"/></div>
  </div>
  <div className="glass-setting-caption"><span className="glass-setting-status">{t(enabled?'glassEnabled':'glassDisabled')}</span><span>{t('glassPreview')}</span></div>
  <div className="glass-transparency-control" data-disabled={!enabled}>
   <div className="glass-range-heading"><label htmlFor={id+'-transparency'}>{t('glassTransparency')}</label><output htmlFor={id+'-transparency'}>{transparency}%</output></div>
   <input id={id+'-transparency'} className="glass-transparency-slider" type="range" min="0" max={MAX_GLASS_TRANSPARENCY} step="1" value={transparency} disabled={!enabled||busy} aria-valuetext={transparency+'%'} style={{'--glass-range-fill':transparency/MAX_GLASS_TRANSPARENCY*100+'%'}} onChange={event=>onPreview(Number(event.target.value))} onPointerUp={onCommit} onPointerCancel={onCommit} onKeyUp={event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(event.key))onCommit();}} onBlur={onCommit}/>
   <div className="glass-range-ends" aria-hidden="true"><span>{t('glassOpaque')}</span><span>{t('glassClear')}</span></div>
  </div>
 </div>;
}
