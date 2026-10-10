import {shiftDate} from './domain.js';

export function dateStripDays(date,today,past=28,future=28){
 const first=shiftDate(date,-past),last=[shiftDate(date,future),shiftDate(today,3)].sort()[0];
 const days=[];
 for(let day=first;day<=last;day=shiftDate(day,1))days.push(day);
 return days;
}
