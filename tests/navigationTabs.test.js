import test from 'node:test';
import assert from 'node:assert/strict';
import {navigationTabs} from '../src/navigationTabs.js';
const nav=['today','habits','tasks','focus','schedule','notes','insights'].map(key=>[key]);
test('More contains only pages absent from the three displayed shortcuts',()=>{
 assert.deepEqual(navigationTabs(['today','habits','tasks','focus','schedule'],nav),{visible:['today','habits','tasks'],overflow:['focus','schedule','notes','insights']});
});
test('reordering shortcuts moves pages between the bar and More without duplication',()=>{
 const result=navigationTabs(['notes','insights','focus','tasks'],nav);
 assert.deepEqual(result,{visible:['notes','insights','focus'],overflow:['today','habits','tasks','schedule']});
 assert.equal(new Set([...result.visible,...result.overflow]).size,nav.length);
});
test('default fillers are omitted from More and invalid shortcuts are ignored',()=>{
 assert.deepEqual(navigationTabs(['notes','notes','invalid'],nav),{visible:['notes','today','habits'],overflow:['tasks','focus','schedule','insights']});
 assert.deepEqual(navigationTabs(undefined,nav).visible,['today','habits','tasks']);
});
