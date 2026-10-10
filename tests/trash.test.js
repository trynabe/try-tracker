import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyData,normalizeBackup,statistics,updateRecordList} from '../src/domain.js';
import {activeData,isTrashed,trashEntries,moveToTrash,restoreFromTrash,permanentlyDelete} from '../src/trash.js';

function apply(data,change){return {...data,[change.kind]:updateRecordList(data[change.kind],change.item,change.deleted)};}
const habit={id:'h',name:'Read',target:2,createdAt:new Date(2026,9,1).getTime(),days:[],logs:[{date:'2026-10-10',value:2,completedAt:123}],_revision:4};

test('trash hides a habit while preserving history, identity and cloud revision for restoration',()=>{
 const original={...emptyData(),habits:[habit]};
 const removed=apply(original,moveToTrash(original,'habits','h',1000));
 assert.equal(activeData(removed).habits.length,0);
 assert.equal(removed.habits[0]._revision,4);
 assert.deepEqual(removed.habits[0].logs,habit.logs);
 assert.equal(original.habits[0].deletedAt,undefined);
 assert.equal(trashEntries(removed).length,1);
 const restored=apply(removed,restoreFromTrash(removed,'habits','h'));
 assert.deepEqual(restored.habits,[habit]);
 assert.equal(trashEntries(restored).length,0);
});

test('backups retain trash and legacy backups default to active records',()=>{
 const data=apply({...emptyData(),habits:[habit]},moveToTrash({...emptyData(),habits:[habit]},'habits','h',1000));
 const imported=normalizeBackup(JSON.parse(JSON.stringify({version:'2.0',data})));
 assert.equal(trashEntries(imported).length,1);
 assert.equal(activeData(imported).habits.length,0);
 assert.deepEqual(restoreFromTrash(imported,'habits','h').item.logs,habit.logs);
 assert.equal(activeData(normalizeBackup({habits:[habit]})).habits.length,1);
 assert.throws(()=>normalizeBackup({habits:[{...habit,deletedAt:'bad'}]}));
 assert.throws(()=>normalizeBackup({habits:[{...habit,deletedAt:-1}]}));
});

test('deleted tasks and habits stop contributing to analytics and restore their original completion dates',()=>{
 const data={...emptyData(),habits:[habit],tasks:[{id:'t',text:'Work',done:true,createdAt:habit.createdAt,completedAt:new Date(2026,9,10).getTime(),subtasks:[{id:'s',text:'Part',done:true}]}]};
 const removed=apply(apply(data,moveToTrash(data,'habits','h',1000)),moveToTrash(data,'tasks','t',1001));
 assert.equal(statistics(removed,7,'2026-10-10').tasksDone,0);
 assert.equal(statistics(removed,7,'2026-10-10').habitRate,0);
 const restored=apply(removed,restoreFromTrash(removed,'tasks','t'));
 assert.equal(statistics(restored,7,'2026-10-10').tasksDone,1);
 assert.deepEqual(restored.tasks[0],data.tasks[0]);
});

test('permanent deletion only accepts trashed items and leaves unrelated records intact',()=>{
 const data={...emptyData(),habits:[{...habit,deletedAt:1000}],notes:[{id:'n',title:'Keep',body:'text'}]};
 const deleted=apply(data,permanentlyDelete(data,'habits','h'));
 assert.deepEqual(deleted.habits,[]);
 assert.deepEqual(deleted.notes,data.notes);
 assert.throws(()=>permanentlyDelete(data,'notes','n'),/TRASH_CHANGED/);
 assert.throws(()=>moveToTrash(data,'profile','profile'));
 assert.throws(()=>restoreFromTrash(data,'notes','n'),/TRASH_CHANGED/);
 assert.throws(()=>moveToTrash(data,'habits','h'),/TRASH_CHANGED/);
});

test('restore rejects overlapping schedules, including Saturday midnight wrapping into Sunday',()=>{
 const trashed={id:'old',title:'Night',day:6,start:'23:00',end:'01:00',deletedAt:1000};
 const current={id:'new',title:'New',day:0,start:'00:30',end:'02:00'};
 const data={...emptyData(),timeblocks:[trashed,current]};
 assert.throws(()=>restoreFromTrash(data,'timeblocks','old'),/TRASH_OVERLAP/);
 assert.equal(data.timeblocks[0].deletedAt,1000);
 const adjacent={...current,start:'01:00'};
 assert.equal(isTrashed(restoreFromTrash({...data,timeblocks:[trashed,adjacent]},'timeblocks','old').item),false);
 assert.doesNotThrow(()=>restoreFromTrash({...data,timeblocks:[trashed,{...current,deletedAt:2000}]},'timeblocks','old'));
});

test('restoring categories checks active names without changing saved focus sessions',()=>{
 const old={id:'old',name:'Study',deletedAt:1000};
 const session={id:'f',subjectId:'old',subject:'Study',date:'2026-10-10',durationSeconds:120};
 const data={...emptyData(),subjects:[old,{id:'new',name:'study'}],focusSessions:[session]};
 assert.throws(()=>restoreFromTrash(data,'subjects','old'),/TRASH_DUPLICATE/);
 const available={...data,subjects:[old]};
 const restored=apply(available,restoreFromTrash(available,'subjects','old'));
 assert.equal(restored.subjects[0].id,session.subjectId);
 assert.deepEqual(restored.focusSessions,[session]);
});

test('trash is sorted newest first across collections; missing deletion fields remain active',()=>{
 const data={...emptyData(),habits:[{...habit,deletedAt:1000}],notes:[{id:'n',title:'Note',body:'text',deletedAt:2000}],tasks:[{id:'t',text:'Active'}]};
 assert.deepEqual(trashEntries(data).map(({kind})=>kind),['notes','habits']);
 assert.equal(activeData(data).tasks.length,1);
});
