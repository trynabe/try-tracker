import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeNoteTags,noteMetadata,normalizeNoteFolders,filterNotes,noteTagCounts} from '../src/notesModel.js';
import {normalizeBackup} from '../src/domain.js';
import {moveToTrash,restoreFromTrash} from '../src/trash.js';
const folders=[{id:'study',name:'Study'},{id:'work',name:'Work'}];
const notes=[{id:'a',title:'First',body:'Network architecture',folderId:'study',tags:['Course','Exam'],pinned:false,createdAt:1,updatedAt:10},{id:'b',title:'Second',body:'Personal reflection',folderId:'',tags:['Life'],pinned:true,createdAt:2,updatedAt:2},{id:'c',title:'Third',body:'Project plan',folderId:'work',tags:['Course'],pinned:false,createdAt:3,updatedAt:20}];
test('legacy notes receive metadata without changing their title or content',()=>{
 const legacy={id:'old',title:'Old note',body:'First line\nSecond line',createdAt:1};
 const restored=normalizeBackup({notes:[legacy]});
 assert.deepEqual(noteMetadata(restored.notes[0]),{folderId:'',tags:[],pinned:false});
 assert.equal(restored.notes[0].body,legacy.body);assert.equal(restored.notes[0].title,legacy.title);
});
test('tags trim prefixes and whitespace, deduplicate case-insensitively and enforce limits',()=>{
 assert.deepEqual(normalizeNoteTags(' #Study ,study, Exam, ,#ภาษาไทย'),['Study','Exam','ภาษาไทย']);
 assert.equal(normalizeNoteTags(Array.from({length:15},(_,i)=>'Tag '+i)).length,10);
 assert.equal(normalizeNoteTags(['x'.repeat(100)])[0].length,40);
 assert.deepEqual(normalizeNoteTags([{},null,42]),[]);
});
test('folder and tag filters combine with text search without mutating notes',()=>{
 const before=JSON.stringify(notes);
 assert.deepEqual(filterNotes(notes,{folders,folder:'study',tag:'course',query:'network'}).map(n=>n.id),['a']);
 assert.deepEqual(filterNotes(notes,{folders,query:'exam'}).map(n=>n.id),['a']);
 assert.deepEqual(filterNotes(notes,{folders,query:'study'}).map(n=>n.id),['a']);
 assert.equal(JSON.stringify(notes),before);
});
test('pinned notes lead every sort, while edited date and title sorts remain predictable',()=>{
 assert.deepEqual(filterNotes(notes,{folders}).map(n=>n.id),['b','c','a']);
 assert.deepEqual(filterNotes(notes,{folders,sort:'title'}).map(n=>n.id),['b','a','c']);
 assert.deepEqual(filterNotes(notes,{folders,folder:'pinned'}).map(n=>n.id),['b']);
});
test('removing a folder makes its notes unfiled while preserving content and metadata',()=>{
 const remaining=[folders[1]],before=JSON.stringify(notes);
 assert.deepEqual(filterNotes(notes,{folders:remaining,folder:'unfiled'}).map(n=>n.id),['b','a']);
 assert.equal(JSON.stringify(notes),before);
});
test('tags and counts exclude trashed notes and count each tag once per note',()=>{
 const records=[...notes,{id:'d',title:'Deleted',body:'Hidden',tags:['Secret'],deletedAt:20}];
 assert.ok(!filterNotes(records,{folders}).some(n=>n.id==='d'));
 assert.deepEqual(noteTagCounts(records).map(t=>[t.name,t.count]),[['Course',2],['Exam',1],['Life',1]]);
 assert.deepEqual(noteTagCounts([{tags:['Tag','tag']}]),[{name:'Tag',count:1}]);
});
test('folders, tags and pin status survive backup restore and trash restoration',()=>{
 const data=normalizeBackup({notes,profile:[{id:'profile',name:'Test',noteFolders:folders}]});
 assert.deepEqual(data.profile[0].noteFolders,folders);assert.deepEqual(data.notes[0].tags,['Course','Exam']);assert.equal(data.notes[1].pinned,true);
 const change=moveToTrash(data,'notes','b',100);data.notes=data.notes.map(n=>n.id==='b'?change.item:n);
 const restored=restoreFromTrash(data,'notes','b').item;
 assert.equal(restored.pinned,true);assert.deepEqual(restored.tags,['Life']);
});
test('folder normalization ignores invalid and duplicate records',()=>{
 assert.deepEqual(normalizeNoteFolders([...folders,{id:'study',name:'Duplicate ID'},{id:'another',name:' study '},{id:'',name:'Bad'},null]),folders);
});

test('folder colors are validated and survive backup restore',()=>{
 const colored=[{id:'color',name:'Colored',color:'#AABBCC'},{id:'legacy',name:'Legacy'},{id:'invalid',name:'Invalid',color:'red;display:none'}];
 const expected=[{id:'color',name:'Colored',color:'#aabbcc'},{id:'legacy',name:'Legacy'},{id:'invalid',name:'Invalid'}];
 assert.deepEqual(normalizeNoteFolders(colored),expected);
 assert.deepEqual(normalizeBackup({profile:[{id:'profile',noteFolders:colored}]}).profile[0].noteFolders,expected);
});
