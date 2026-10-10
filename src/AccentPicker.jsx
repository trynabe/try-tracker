import React,{useState} from 'react';
import {Check,Plus} from 'lucide-react';
import {accentPresets,accentSettings,accentColor,accentContrast,safeAccent} from './accent';

export default function AccentPicker({profile,t,busy,onSave,Modal}){
 const [open,setOpen]=useState(false),[draft,setDraft]=useState(accentColor(profile));
 const settings=accentSettings(profile),custom=settings.accent==='custom';
 const selectedColor=safeAccent(draft);
 return <><div className="accent-picker" role="group" aria-label={t('accent')}>
  {Object.entries(accentPresets).map(([key,color])=><button type="button" key={key} disabled={busy} aria-label={t('color'+key[0].toUpperCase()+key.slice(1))} title={t('color'+key[0].toUpperCase()+key.slice(1))} aria-pressed={settings.accent===key} onClick={()=>onSave({accent:key})}><span className={'accent-dot '+(settings.accent===key?'selected':'')} style={{background:color,color:accentContrast(color)}}>{settings.accent===key&&<Check size={18}/>}</span></button>)}
  <button type="button" disabled={busy} aria-label={t('customAccent')} title={t('customAccent')} aria-pressed={custom} onClick={()=>{setDraft(custom?settings.customAccent:safeAccent(profile.customAccent)||accentColor(profile));setOpen(true);}}><span className={'accent-dot accent-custom '+(custom?'selected':'')} style={{background:custom?settings.customAccent:'conic-gradient(#f87171,#facc15,#4ade80,#60a5fa,#c084fc,#f87171)',color:custom?accentContrast(settings.customAccent):'#111827'}}>{custom?<Check size={18}/>:<Plus size={18}/>}</span></button>
 </div>{open&&<Modal title={t('customAccent')} onClose={()=>!busy&&setOpen(false)} footer={<><button className="secondary" disabled={busy} onClick={()=>setOpen(false)}>{t('cancel')}</button><button className="primary" disabled={busy||!selectedColor} onClick={async()=>{if(await onSave({accent:'custom',customAccent:selectedColor}))setOpen(false);}}>{busy?t('saving'):t('save')}</button></>}>
  <div className="custom-accent-fields"><label className="field"><span>{t('chooseAccent')}</span><input className="custom-accent-input" type="color" value={selectedColor||accentPresets.violet} onChange={e=>setDraft(e.target.value)}/></label><label className="field"><span>{t('hexColor')}</span><input value={draft} placeholder="#6255e7" maxLength={7} spellCheck={false} autoComplete="off" onChange={e=>setDraft(e.target.value)} aria-invalid={!selectedColor}/></label></div>
  <div className="custom-accent-preview" style={{background:selectedColor||accentPresets.violet,color:accentContrast(selectedColor)}}>{t('colorPreview')}</div>
 </Modal>}</>;
}
