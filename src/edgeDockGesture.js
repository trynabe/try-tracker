export const EDGE_DOCK_TRAVEL=112;

export function edgeGestureIntent(dx,dy,startedOpen){
 if(Math.max(Math.abs(dx),Math.abs(dy))<8)return 'pending';
 if(Math.abs(dy)>Math.abs(dx)*1.2)return 'scroll';
 if(Math.abs(dx)>Math.abs(dy)*1.2)return (startedOpen?dx<0:dx>0)?'drag':'cancel';
 return 'pending';
}

export function edgeGestureProgress(dx,startedOpen){
 return Math.max(0,Math.min(1,(startedOpen?1:0)+dx/EDGE_DOCK_TRAVEL));
}

export function settleEdgeGesture(dx,elapsedMs,startedOpen){
 const velocity=dx/Math.max(1,elapsedMs);
 if(Math.abs(dx)>=18&&Math.abs(velocity)>.35)return velocity>0;
 return edgeGestureProgress(dx,startedOpen)>=.5;
}
