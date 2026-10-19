export function noteFolderColor(value){return typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value)?value.toLowerCase():'';}
export const NOTE_TAG_LIMIT=10;
export const NOTE_TAG_LENGTH=40;
export function normalizeNoteTags(value){
 const values=Array.isArray(value)?value:typeof value==='string'?value.split(/[,\n]/):[];
 const seen=new Set();
 return values.filter(v=>typeof v==='string').map(v=>v.trim().replace(/^#+/,'').trim().slice(0,NOTE_TAG_LENGTH)).filter(v=>{const key=v.toLocaleLowerCase();if(!v||seen.has(key))return false;seen.add(key);return true;}).slice(0,NOTE_TAG_LIMIT);
}
export function noteMetadata(note={}){return {folderId:typeof note.folderId==='string'?note.folderId.slice(0,200):'',tags:normalizeNoteTags(note.tags),pinned:note.pinned===true};}
export function normalizeNoteFolders(value){
 if(!Array.isArray(value))return [];
 const ids=new Set(),names=new Set();
 return value.filter(folder=>{if(!folder||typeof folder.id!=='string'||!folder.id||folder.id.length>200||typeof folder.name!=='string')return false;const name=folder.name.trim().slice(0,60),key=name.toLocaleLowerCase();if(!name||ids.has(folder.id)||names.has(key))return false;ids.add(folder.id);names.add(key);return true;}).slice(0,100).map(folder=>({id:folder.id,name:folder.name.trim().slice(0,60),...(noteFolderColor(folder.color)?{color:noteFolderColor(folder.color)}:{})}));
}
export function filterNotes(notes,{query='',folder='all',tag='',sort='updated',folders=[],searchTags=true}={}){
 const known=new Set(folders.map(f=>f.id)),search=query.trim().toLocaleLowerCase(),tagKey=tag.toLocaleLowerCase();
 const folderNames=new Map(folders.map(f=>[f.id,f.name]));
 return notes.filter(note=>{
  if(note.deletedAt)return false;
  const meta=noteMetadata(note);
  if(folder==='pinned'&&!meta.pinned||folder==='unfiled'&&known.has(meta.folderId)||!['all','pinned','unfiled'].includes(folder)&&meta.folderId!==folder)return false;
  if(tagKey&&!meta.tags.some(t=>t.toLocaleLowerCase()===tagKey))return false;
  return !search||[note.title,note.body,folderNames.get(meta.folderId),...(searchTags?meta.tags:[])].join(' ').toLocaleLowerCase().includes(search);
 }).sort((a,b)=>{
  const pin=Number(noteMetadata(b).pinned)-Number(noteMetadata(a).pinned);if(pin)return pin;
  if(sort==='title')return String(a.title).localeCompare(String(b.title));
  const field=sort==='created'?'createdAt':'updatedAt';
  return (Number(b[field]||b.createdAt)||0)-(Number(a[field]||a.createdAt)||0)||String(a.id).localeCompare(String(b.id));
 });
}
export function noteTagCounts(notes){
 const tags=new Map();
 for(const note of notes){if(note.deletedAt)continue;for(const tag of normalizeNoteTags(note.tags)){const key=tag.toLocaleLowerCase(),entry=tags.get(key)||{name:tag,count:0};entry.count++;tags.set(key,entry);}}
 return [...tags.values()].sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name));
}
