import {createClient} from '@supabase/supabase-js';
import {emptyData} from './domain';
const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase=url&&key?createClient(url,key):null;
const strip=item=>{const {_revision,...payload}=item;return payload;};
export async function readCloud(){const data=[];for(let from=0;;from+=1000){const {data:page,error}=await supabase.from('tracker_records').select('kind,id,payload,revision').order('kind').order('id').range(from,from+999);if(error)throw error;data.push(...page);if(page.length<1000)break;}const result=emptyData();data.forEach(r=>{if(result[r.kind])result[r.kind].push({...r.payload,id:r.id,_revision:r.revision});});return result;}
export async function commitCloud(changes){const {error}=await supabase.rpc('tracker_commit',{changes:changes.map(c=>({kind:c.kind,id:c.item.id,revision:c.item._revision??null,payload:strip(c.item),deleted:!!c.deleted}))});if(error)throw error;}
export async function restoreCloud(data){const records=Object.entries(data).flatMap(([kind,list])=>list.map(item=>({kind,id:item.id,payload:strip(item)})));const {error}=await supabase.rpc('tracker_restore',{records});if(error)throw error;}
export function backupData(data){return Object.fromEntries(Object.entries(data).map(([kind,list])=>[kind,list.map(strip)]));}
