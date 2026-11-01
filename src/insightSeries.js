import {dateKey} from './domain.js';

// Build daily values from the same records used by the period summary.
export function dailyInsightSeries(stats){
 const days=new Map(stats.trend.map(point=>[point.date,{date:point.date,habits:point.total?point.rate:null,tasks:0,focus:0}]));
 for(const task of stats.completedTasks){
  const day=days.get(dateKey(task.completedAt||task.createdAt));
  if(day)day.tasks++;
 }
 for(const session of stats.sessions){
  const day=days.get(session.date||dateKey(session.timestamp));
  if(day)day.focus+=session.durationSeconds/60;
 }
 return [...days.values()];
}
