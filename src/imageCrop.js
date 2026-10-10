const clamp=(value,min,max,fallback)=>Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;
export function normalizeImageCrop(value){return {zoom:clamp(value?.zoom,1,4,1),x:clamp(value?.x,-1,1,0),y:clamp(value?.y,-1,1,0)};}

export function imageCropGeometry(imageWidth,imageHeight,frameWidth,frameHeight,value){
 if(![imageWidth,imageHeight,frameWidth,frameHeight].every(n=>Number.isFinite(n)&&n>0))return null;
 const crop=normalizeImageCrop(value),scale=Math.max(frameWidth/imageWidth,frameHeight/imageHeight)*crop.zoom;
 const width=imageWidth*scale,height=imageHeight*scale;
 return {width,height,left:(frameWidth-width)*(1-crop.x)/2,top:(frameHeight-height)*(1-crop.y)/2};
}

export function panImageCrop(value,dx,dy,imageWidth,imageHeight,frameWidth,frameHeight){
 const crop=normalizeImageCrop(value),rangeX=Math.max(0,(imageWidth-frameWidth)/2),rangeY=Math.max(0,(imageHeight-frameHeight)/2);
 return normalizeImageCrop({...crop,x:rangeX?crop.x+dx/rangeX:0,y:rangeY?crop.y+dy/rangeY:0});
}
