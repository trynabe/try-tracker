import test from 'node:test';
import assert from 'node:assert/strict';
import {edgeGestureIntent,edgeGestureProgress,settleEdgeGesture} from '../src/edgeDockGesture.js';

test('edge gestures leave taps, vertical scrolling and ambiguous diagonals alone',()=>{
 assert.equal(edgeGestureIntent(4,3,false),'pending');
 assert.equal(edgeGestureIntent(7,35,false),'scroll');
 assert.equal(edgeGestureIntent(14,14,false),'pending');
});
test('opening requires a rightward gesture and closing requires a leftward gesture',()=>{
 assert.equal(edgeGestureIntent(30,5,false),'drag');
 assert.equal(edgeGestureIntent(-30,5,false),'cancel');
 assert.equal(edgeGestureIntent(-30,5,true),'drag');
 assert.equal(edgeGestureIntent(30,5,true),'cancel');
});
test('the dock tracks the finger and remains bounded at both ends',()=>{
 assert.equal(edgeGestureProgress(56,false),.5);
 assert.equal(edgeGestureProgress(-56,true),.5);
 assert.equal(edgeGestureProgress(-500,false),0);
 assert.equal(edgeGestureProgress(500,true),1);
});
test('a slow drag settles on its nearest side',()=>{
 assert.equal(settleEdgeGesture(32,500,false),false);
 assert.equal(settleEdgeGesture(80,500,false),true);
 assert.equal(settleEdgeGesture(-32,500,true),true);
 assert.equal(settleEdgeGesture(-80,500,true),false);
});
test('a short deliberate flick opens or closes without requiring a half-width drag',()=>{
 assert.equal(settleEdgeGesture(24,50,false),true);
 assert.equal(settleEdgeGesture(-24,50,true),false);
 assert.equal(settleEdgeGesture(5,1,false),false);
 assert.equal(settleEdgeGesture(-5,1,true),true);
});
