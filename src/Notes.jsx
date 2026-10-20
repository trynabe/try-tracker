import React,{useEffect,useState} from 'react';
import {NotebookPen,Folder,Pin,Search,SlidersHorizontal,Copy,Trash2,X,Check,Plus,ArrowUpRight} from 'lucide-react';
import {filterNotes,noteMetadata,noteFolderColor} from './notesModel.js';
import {habitPalette} from './habitVisuals.js';
import './notes.css';

export default function Notes({folderEditor,setFolderEditor,notes,folders,folder,onFolderChange,query,onQueryChange,t,language,busy,Modal,onEdit,onNew,onPin,onRemove,onSaveFolder,onDeleteFolder,notify}){
 const [folderColor,setFolderColor]=useState(''),[folderName,setFolderName]=useState(''),[folderError,setFolderError]=useState(''),[readingNote,setReadingNote]=useState(null);
 const known=new Set(folders.map(f=>f.id));
 const current=['all','pinned','unfiled'].includes(folder)||known.has(folder)?folder:'all';
 const visible=filterNotes(notes,{query,folder:current,folders,searchTags:false});
 const pinnedNotes=visible.filter(note=>noteMetadata(note).pinned),otherNotes=visible.filter(note=>!noteMetadata(note).pinned);
 
 const emptyTitle=query?'notesNoResults':!notes.length?'notesStartTitle':current==='pinned'?'notesNoPins':'notesFolderEmpty';
 const emptyHint=query?'notesNoResultsHint':!notes.length?'notesStartHint':current==='pinned'?'notesNoPinsHint':'notesFolderEmptyHint';
 const title=current==='all'?t('notesAll'):current==='pinned'?t('notesPinned'):current==='unfiled'?t('notesUnfiled'):folders.find(f=>f.id===current)?.name;
 const folderLabel=note=>folders.find(f=>f.id===noteMetadata(note).folderId)?.name||t('notesUnfiled');
 const chooseFolder=id=>onFolderChange(id);
 useEffect(()=>{setFolderName(folderEditor?.name||'');setFolderColor(noteFolderColor(folderEditor?.color));setFolderError('');},[folderEditor]);
 const editFolder=value=>setFolderEditor(value);
 const closeFolder=()=>{if(!busy)setFolderEditor(null);};
 const saveFolder=async e=>{e.preventDefault();const result=await onSaveFolder(folderName,folderEditor.id,folderColor);if(result?.ok){chooseFolder(result.id);setFolderEditor(null);}else if(result?.error)setFolderError(t(result.error));};
 const copy=async note=>{try{await navigator.clipboard.writeText(note.body);notify(t('copied'));}catch{notify(t('noteCopiedError'),'error');}};
 const count=id=>id==='all'?notes.length:id==='pinned'?notes.filter(n=>noteMetadata(n).pinned).length:id==='unfiled'?notes.filter(n=>!known.has(noteMetadata(n).folderId)).length:notes.filter(n=>noteMetadata(n).folderId===id).length;
 const category=(id,label)=><button type="button" key={id} className={'notes-folder-button '+(current===id?'selected':'')} aria-pressed={current===id} onClick={()=>chooseFolder(id)}><span>{label}</span><small>{count(id)}</small></button>;
 const card=note=>{
  const meta=noteMetadata(note),stamp=note.updatedAt||note.createdAt;
  return <article key={note.id} className={'notes-item '+(meta.pinned?'is-pinned':'')}>
   <div className="notes-item-top"><span className="notes-item-folder"><span className="notes-paper-icon"><NotebookPen size={16}/></span><span>{folderLabel(note)}</span></span><button type="button" className={'icon-btn notes-pin '+(meta.pinned?'selected':'')} disabled={busy} aria-label={t(meta.pinned?'notesUnpin':'notesPin')+': '+note.title} title={t(meta.pinned?'notesPinnedState':'notesPin')} aria-pressed={meta.pinned} onClick={()=>onPin(note,!meta.pinned)}><Pin size={16} fill={meta.pinned?'currentColor':'none'}/></button></div>
   <button type="button" className="notes-item-open" disabled={busy} onClick={()=>setReadingNote(note)} aria-label={t('notesOpen')+': '+note.title}><h3>{note.title}</h3><p>{note.body}</p></button>
   <footer><time dateTime={new Date(Number(stamp)||0).toISOString()}>{new Date(Number(stamp)||0).toLocaleDateString(language==='th'?'th-TH':'en-US',{day:'numeric',month:'short',year:'numeric'})}</time><div className="notes-item-actions"><button type="button" className="icon-btn" aria-label={t('copy')+': '+note.title} title={t('copy')} onClick={()=>copy(note)}><Copy size={15}/></button><button type="button" className="icon-btn" disabled={busy} aria-label={t('delete')+': '+note.title} title={t('delete')} onClick={()=>onRemove(note)}><Trash2 size={15}/></button><button type="button" className="icon-btn" disabled={busy} aria-label={t('edit')+': '+note.title} title={t('edit')} onClick={()=>onEdit(note)}><ArrowUpRight size={17}/></button></div></footer>
  </article>;
 };
 return <div className="notes-workspace">
  <section className="notes-browser" aria-label={t('notesLibrary')}>
   <div className="notes-navigation"><nav className="notes-folder-nav" aria-label={t('notesLibrary')}>{category('all',t('notesAll'))}{category('pinned',t('notesPinned'))}{category('unfiled',t('notesUnfiled'))}</nav></div>
   {!!folders.length&&<div className="notes-folder-strip"><div className="notes-custom-folders">{folders.map(value=><div className={'notes-folder-row '+(current===value.id?'selected':'')+(value.color?' has-color':'')} style={value.color?{'--folder-color':value.color}:undefined} key={value.id}><button type="button" className="notes-folder-chip" aria-pressed={current===value.id} onClick={()=>chooseFolder(value.id)}><Folder size={15}/><span title={value.name}>{value.name.length>20?value.name.slice(0,20)+'…':value.name}</span><small>{count(value.id)}</small></button><button type="button" className="icon-btn notes-folder-settings" disabled={busy} aria-label={t('notesManageFolder')+': '+value.name} title={t('notesManageFolder')} onClick={()=>editFolder(value)}><SlidersHorizontal size={13}/></button></div>)}</div></div>}
   <div className="notes-tools"><div className="search-input notes-search"><Search size={17}/><input aria-label={t('searchNotes')} placeholder={t('notesSearchHint')} value={query} onChange={e=>onQueryChange(e.target.value)}/>{query&&<button type="button" className="icon-btn" aria-label={t('notesClearSearch')} onClick={()=>onQueryChange('')}><X size={15}/></button>}</div></div>
  </section>
  <div className="notes-main">
   <header className="notes-results-line"><div>{current!=='all'&&<h2>{title}</h2>}<p aria-live="polite">{visible.length} {t('notesCount')}{query?' · '+t('notesFiltered'):''}</p></div>{(query)&&<button type="button" className="text-btn" onClick={()=>onQueryChange('')}>{t('notesClearFilters')}</button>}</header>
   {!!pinnedNotes.length&&<section className="notes-group notes-pinned-group" aria-label={t('notesPinned')}>{current!=='pinned'&&<div className="notes-group-heading"><h3>{t('notesPinned')}</h3><span>{pinnedNotes.length}</span></div>}<div className="notes-collection grid">{pinnedNotes.map(card)}</div></section>}
   {!!otherNotes.length&&<section className="notes-group notes-other-group" aria-label={t('notesOther')}>{!!pinnedNotes.length&&<div className="notes-group-heading"><h3>{t('notesOther')}</h3><span>{otherNotes.length}</span></div>}<div className="notes-collection grid">{otherNotes.map(card)}</div></section>}
   {!visible.length&&<section className="notes-empty"><span><NotebookPen size={30}/></span><h3>{t(emptyTitle)}</h3><p>{t(emptyHint)}</p></section>}
  </div>
  {readingNote&&<Modal title={readingNote.title} onClose={()=>setReadingNote(null)} variant="note"><article className="notes-reader"><p className="notes-reader-folder">{folderLabel(readingNote)}</p><div className="notes-reader-body">{readingNote.body}</div></article></Modal>}
  {folderEditor&&<Modal title={t(folderEditor.id?'notesManageFolder':'notesNewFolder')} onClose={closeFolder} footer={<>{folderEditor.id&&<button type="button" className="secondary danger" disabled={busy} onClick={async()=>{if(await onDeleteFolder(folderEditor.id)){if(current===folderEditor.id)chooseFolder('unfiled');setFolderEditor(null);}}}>{t('notesDeleteFolder')}</button>}<button type="submit" form="notes-folder-form" className="primary notes-folder-save" disabled={busy}>{busy?t('saving'):t('save')}</button></>}><form id="notes-folder-form" onSubmit={saveFolder}><label className="field"><span>{t('notesFolderName')}</span><input required maxLength={20} value={folderName} disabled={busy} onChange={e=>{setFolderName(e.target.value);setFolderError('');}} autoComplete="off"/></label><fieldset className="schedule-color-field habit-color-field notes-folder-colors" disabled={busy}><legend>{t('notesFolderColor')}</legend><div className="schedule-color-panel"><div className="schedule-color-picker">{habitPalette.map(color=><button type="button" className={'schedule-color-swatch '+(folderColor===color?'selected':'')} key={color} style={{'--swatch-color':color}} aria-label={t('notesFolderColor')+' '+color} aria-pressed={folderColor===color} onClick={()=>setFolderColor(color)}><i>{folderColor===color&&<Check size={13}/>}</i></button>)}<label className={'schedule-custom-color '+(folderColor&&!habitPalette.includes(folderColor)?'selected':'')} style={{'--custom-color':folderColor||habitPalette[0]}} title={t('customColor')}><span className="schedule-custom-circle"><Plus size={16} aria-hidden="true"/></span><input type="color" aria-label={t('customColor')} value={folderColor||habitPalette[0]} onChange={e=>setFolderColor(e.target.value)}/></label></div></div></fieldset>{folderEditor.id&&<p className="muted notes-folder-hint">{t('notesDeleteFolderHint')}</p>}{folderError&&<p className="danger" role="alert">{folderError}</p>}</form></Modal>}
 </div>;
}
