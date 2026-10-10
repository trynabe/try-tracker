import test from 'node:test';
import assert from 'node:assert/strict';
import {dateStripDays} from '../src/dateStrip.js';
test('mobile date strip includes past dates, selection and only three future placeholders',()=>{
 const days=dateStripDays('2026-10-11','2026-10-11');
 assert.equal(days.length,32);assert.equal(days[0],'2026-09-13');assert.equal(days.at(-1),'2026-10-14');
 assert.ok(days.includes('2026-10-11'));
});
test('extending either side retains consecutive dates across year and leap-day boundaries',()=>{
 const original=dateStripDays('2024-02-29','2024-07-01');
 const extended=dateStripDays('2024-02-29','2024-07-01',56,56);
 assert.equal(extended.length,113);assert.ok(extended.includes('2024-02-29'));
 assert.deepEqual(extended.slice(28,-28),original);
 const year=dateStripDays('2026-01-01','2026-01-01',2,28);
 assert.deepEqual(year,['2025-12-30','2025-12-31','2026-01-01','2026-01-02','2026-01-03','2026-01-04']);
});
