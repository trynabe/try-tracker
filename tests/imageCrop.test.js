import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeImageCrop,imageCropGeometry,panImageCrop} from '../src/imageCrop.js';
import {normalizeBackup} from '../src/domain.js';

test('zoom and extreme panning always fill square and responsive cover frames',()=>{
 for(const [iw,ih] of [[1200,800],[800,1200],[600,600]])for(const [fw,fh] of [[240,240],[350,128],[1000,156]])for(const zoom of [1,2,4])for(const x of [-1,0,1])for(const y of [-1,0,1]){
  const g=imageCropGeometry(iw,ih,fw,fh,{zoom,x,y});
  assert.ok(g.left<=.001&&g.top<=.001);assert.ok(g.left+g.width>=fw-.001&&g.top+g.height>=fh-.001);
 }
});
test('dragging clamps at image edges and cannot pan an axis with no spare image',()=>{
 assert.deepEqual(panImageCrop({zoom:2,x:0,y:0},10000,-10000,400,200,200,200),{zoom:2,x:1,y:0});
 assert.deepEqual(panImageCrop({zoom:2,x:0,y:0},-10000,10000,400,400,200,200),{zoom:2,x:-1,y:1});
});
test('invalid crop data and unloaded dimensions fall back safely',()=>{
 assert.deepEqual(normalizeImageCrop({zoom:Infinity,x:'100%',y:NaN}),{zoom:1,x:0,y:0});
 assert.deepEqual(normalizeImageCrop({zoom:99,x:-99,y:99}),{zoom:4,x:-1,y:1});
 assert.equal(imageCropGeometry(0,100,100,100),null);
});
test('profile and cover adjustments survive backup import independently',()=>{
 const photo='data:image/webp;base64,AAAA',photoCrop={zoom:2.4,x:.35,y:-.6},coverPhotoCrop={zoom:1.7,x:-.2,y:.8};
 const data=normalizeBackup({data:{profile:[{id:'profile',photo,coverPhoto:photo,photoCrop,coverPhotoCrop}]}});
 assert.deepEqual(data.profile[0].photoCrop,photoCrop);assert.deepEqual(data.profile[0].coverPhotoCrop,coverPhotoCrop);assert.equal(data.profile[0].photo,photo);
});
test('legacy photos retain their original centered cover framing',()=>{
 const data=normalizeBackup({data:{profile:[{id:'profile',photo:'data:image/png;base64,AAAA'}]}});
 assert.deepEqual(data.profile[0].photoCrop,{zoom:1,x:0,y:0});
 assert.deepEqual(imageCropGeometry(400,200,100,100,data.profile[0].photoCrop),{width:200,height:100,left:-50,top:0});
});
