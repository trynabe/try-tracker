import React,{useRef,useState} from 'react';
import {Pin,Check} from 'lucide-react';
import {noteMetadata} from './notesModel.js';
import NotesSelect from './NotesSelect.jsx';
import './notes.css';

export default function NoteEditor({editor,folders,t,busy,Modal,onClose,onSubmit}){
 const item=editor.item,meta=noteMetadata({...editor.seed,...item});
 const [title,setTitle]=useState(item?.title||''),[body,setBody]=useState(item?.body||''),[folderId,setFolderId]=useState(meta.folderId),[pinned,setPinned]=useState(meta.pinned);
 const submitting=useRef(false),[saving,setSaving]=useState(false);
 const submit=async e=>{e.preventDefault();if(busy||submitting.current||!title.trim()||!body.trim())return;submitting.current=true;setSaving(true);try{await onSubmit({title:title.trim(),body:body.trim(),folderId:folders.some(f=>f.id===folderId)?folderId:'',pinned});}finally{submitting.current=false;setSaving(false);}};
 return <Modal title={t(item?'notesEditNote':'addNote')} variant="note" creationKind="notes" t={t} onClose={()=>{if(!submitting.current)onClose();}} footer={<><button type="submit" form="note-editor-form" className="primary" disabled={busy||saving}><Check size={17} className="creation-save-icon" aria-hidden="true"/>{busy||saving?t('saving'):t('save')}</button></>}>
  <form id="note-editor-form" className="notes-editor" onSubmit={submit}><fieldset disabled={busy||saving}>
   <div className="notes-editor-meta"><div className="field notes-editor-folder"><span>{t('notesFolder')}</span><NotesSelect label={t('notesFolder')} value={folders.some(f=>f.id===folderId)?folderId:''} onChange={setFolderId} options={[{value:'',label:t('notesUnfiled')},...folders.map(folder=>({value:folder.id,label:folder.name}))]}/></div><label className={'notes-editor-pin '+(pinned?'selected':'')}><input type="checkbox" checked={pinned} onChange={e=>setPinned(e.target.checked)}/><Pin size={16}/><span>{t('notesPin')}</span></label></div>
   <label className="field notes-title-field"><span>{t('title')}</span><input required maxLength={300} placeholder={t('notesTitleHint')} value={title} onChange={e=>setTitle(e.target.value)}/></label>
   <label className="field notes-body-field"><span>{t('body')}</span><textarea required rows={12} maxLength={100000} placeholder={t('notesBodyHint')} value={body} onChange={e=>setBody(e.target.value)}/></label>
  </fieldset></form>
 </Modal>;
}
