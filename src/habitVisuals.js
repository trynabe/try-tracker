import {dateKey,shiftDate,weekday,dueHabit,habitValue,habitDone} from './domain.js';
import {normalizeScheduleColor} from './scheduleColors.js';
import {resolveIcon} from './iconCatalog.js';

export const habitPalette=['#43d6ab','#f27d98','#36c9cc','#67a7ed','#aa8bf5','#f4bb62','#e98bd4'];
const iconColors={book:0,water:2,exercise:1,walking:1,code:3,study:4,meditate:4,food:0,sleep:3,money:5,art:6};
export function habitColor(habit){
 return normalizeScheduleColor(habit.color)||habitPalette[iconColors[resolveIcon(habit.emoji)]??Math.abs([...String(habit.id||habit.name||'')].reduce((hash,char)=>hash+char.charCodeAt(0),0))%habitPalette.length];
}

// Monday-first columns. The final column includes today and muted future days.
export function habitHistory(habit,today,columns=20){
 const lastMonday=shiftDate(today,-(weekday(today)+6)%7);
 const start=shiftDate(lastMonday,-(columns-1)*7);
 return Array.from({length:columns*7},(_,index)=>{
  const date=shiftDate(start,index);
  const value=habitValue(habit,date);
  const available=date<=today&&date>=dateKey(habit.createdAt)&&dueHabit(habit,date);
  return {date,value,available,level:!available?'inactive':habitDone(habit,date)?'done':value>0?'partial':'empty'};
 });
}
