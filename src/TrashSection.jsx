import React,{useState} from 'react';
import {Trash2,RotateCcw,Search} from 'lucide-react';
import {trashEntries,trashLabel} from './trash';
import './trash.css';

const kindLabels={habits:'habits',tasks:'tasks',subjects:'categories',timeblocks:'schedule',notes:'notes',focusSessions:'history'};
export default function TrashSection({data,t,language,busy,onRestore,onDelete}){
 const [query,setQuery]=useState('');
 const entries=trashEntries(data);
 const filtered=entries.filter(({kind,item})=>(trashLabel(item)+' '+t(kindLabels[kind])).toLowerCase().includes(query.trim().toLowerCase()));
 return <section className="panel trash-panel" aria-labelledby="trash-heading">
  <div className="section-head"><h2 id="trash-heading"><Trash2 size={20}/>{t('trash')}</h2><span className="tag">{entries.length}</span></div>
  <p className="muted">{t('trashDesc')}</p>
  {entries.length>0&&<div className="search-input trash-search"><Search size={17}/><input aria-label={t('searchTrash')} placeholder={t('searchTrash')} value={query} onChange={e=>setQuery(e.target.value)}/></div>}
  <div className="trash-list">{filtered.map(({kind,item})=><article className="trash-row" key={kind+':'+item.id}>
   <div className="trash-item-main"><strong>{trashLabel(item)}</strong><div className="trash-item-meta"><span className="tag">{t(kindLabels[kind])}</span><span>{t('deletedOn')} {new Date(item.deletedAt).toLocaleString(language==='th'?'th-TH':'en-US',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</span></div></div>
   <div className="trash-actions"><button className="secondary" disabled={busy} aria-label={t('restoreItem')+': '+trashLabel(item)} onClick={()=>onRestore(kind,item)}><RotateCcw size={16}/>{t('restoreItem')}</button><button className="secondary danger" disabled={busy} aria-label={t('deleteForever')+': '+trashLabel(item)} onClick={()=>onDelete(kind,item)}><Trash2 size={16}/>{t('deleteForever')}</button></div>
  </article>)}</div>
  {!filtered.length&&<div className="empty"><Trash2 size={28}/><p>{t(entries.length?'noTrashResults':'emptyTrash')}</p></div>}
 </section>;
}
