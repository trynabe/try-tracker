import test from 'node:test';
import assert from 'node:assert/strict';
import {uiVariantForPath} from '../src/release.js';

test('the main app, existing preview links and authentication paths use the new interface',()=>{
 for(const path of ['/', '/preview/2.6', '/preview/2.6/', '/auth/callback', '/reset-password', '']){
  assert.equal(uiVariantForPath(path),'v26',path);
 }
});

test('the classic interface requires its explicit path',()=>{
 assert.equal(uiVariantForPath('/classic'),'classic');
 assert.equal(uiVariantForPath('/classic/'),'classic');
 for(const path of ['/classic/settings','/classic-preview','/Classic'])assert.equal(uiVariantForPath(path),'v26',path);
});
