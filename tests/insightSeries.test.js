import test from 'node:test';
import assert from 'node:assert/strict';
import {dailyInsightSeries} from '../src/insightSeries.js';

const timestamp=date=>new Date(date+'T12:00:00').getTime();
const trend=[{date:'2026-10-30',rate:0,total:0},{date:'2026-10-31',rate:0,total:2},{date:'2026-11-01',rate:50,total:2}];

test('daily habit chart distinguishes no scheduled habits from zero completion',()=>{
 const series=dailyInsightSeries({trend,completedTasks:[],sessions:[]});
 assert.deepEqual(series.map(point=>point.habits),[null,0,50]);
 assert.deepEqual(series.map(point=>point.date),trend.map(point=>point.date));
});

test('daily task values count completion dates, with the existing legacy creation-date fallback',()=>{
 const series=dailyInsightSeries({trend,completedTasks:[
  {createdAt:timestamp('2026-10-30'),completedAt:timestamp('2026-11-01')},
  {createdAt:timestamp('2026-11-01')},
  {createdAt:timestamp('2026-10-29'),completedAt:timestamp('2026-10-29')}
 ],sessions:[]});
 assert.deepEqual(series.map(point=>point.tasks),[0,0,2]);
});

test('focus chart sums exact seconds per session date and excludes dates outside the selected range',()=>{
 const series=dailyInsightSeries({trend,completedTasks:[],sessions:[
  {date:'2026-10-31',durationSeconds:90},
  {date:'2026-10-31',durationSeconds:30},
  {timestamp:timestamp('2026-11-01'),durationSeconds:1500},
  {date:'2026-10-29',durationSeconds:900}
 ]});
 assert.deepEqual(series.map(point=>point.focus),[0,2,25]);
});
