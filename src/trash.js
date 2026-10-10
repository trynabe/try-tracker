// Keep deleted records in their original collection so cloud revisions and backups
// continue to work with the existing database schema.
export const trashKinds=['habits','tasks','subjects','timeblocks','notes','focusSessions'];
export const isTrashed=item=>Number.isFinite(item?.deletedAt)&&item.deletedAt>0;
export const activeData=data=>Object.fromEntries(Object.entries(data).map(([kind,list])=>[kind,trashKinds.includes(kind)?list.filter(item=>!isTrashed(item)):list]));
export const trashEntries=data=>trashKinds.flatMap(kind=>(data[kind]||[]).filter(isTrashed).map(item=>({kind,item}))).sort((a,b)=>b.item.deletedAt-a.item.deletedAt);
export const trashLabel=item=>item.name||item.text||item.title||item.subject||item.id;

export function moveToTrash(data,kind,id,deletedAt=Date.now()){
 if(!trashKinds.includes(kind))throw Error('Invalid trash kind');
 const item=data[kind]?.find(record=>record.id===id);
 if(!item||isTrashed(item))throw Error('TRASH_CHANGED');
 return {kind,item:{...item,deletedAt}};
}

const intervals=block=>{
 const [h,m]=block.start.split(':').map(Number);
 const [eh,em]=block.end.split(':').map(Number);
 const start=block.day*1440+h*60+m;
 const end=start+((eh*60+em-h*60-m+1440)%1440);
 return end>10080?[[start,10080],[0,end-10080]]:[[start,end]];
};
export function restoreFromTrash(data,kind,id){
 if(!trashKinds.includes(kind))throw Error('Invalid trash kind');
 const item=data[kind]?.find(record=>record.id===id);
 if(!item||!isTrashed(item))throw Error('TRASH_CHANGED');
 const active=(data[kind]||[]).filter(record=>!isTrashed(record));
 if(kind==='subjects'&&active.some(record=>record.name.toLowerCase()===item.name.toLowerCase()))throw Error('TRASH_DUPLICATE');
 if(kind==='timeblocks'&&active.some(record=>intervals(record).some(([a,z])=>intervals(item).some(([x,y])=>x<z&&y>a))))throw Error('TRASH_OVERLAP');
 const {deletedAt,...restored}=item;
 return {kind,item:restored};
}
export function permanentlyDelete(data,kind,id){
 if(!trashKinds.includes(kind))throw Error('Invalid trash kind');
 const item=data[kind]?.find(record=>record.id===id);
 if(!item||!isTrashed(item))throw Error('TRASH_CHANGED');
 return {kind,item,deleted:true};
}
