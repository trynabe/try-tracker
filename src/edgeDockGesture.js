export const EDGE_DOCK_WIDTH=24;
export const EDGE_DOCK_TRAVEL=112;

export function edgeGestureIntent(dx,dy,startedOpen,openingDirection=1){
 if(Math.max(Math.abs(dx),Math.abs(dy))<8)return 'pending';
 if(Math.abs(dy)>Math.abs(dx)*1.2)return 'scroll';
 if(Math.abs(dx)>Math.abs(dy)*1.2)return (startedOpen?dx<0:dx*openingDirection>0)?'drag':'cancel';
 return 'pending';
}

export function edgeGestureProgress(dx,startedOpen,openingDirection=1){
 const distance=startedOpen?dx:dx*openingDirection;
 return Math.max(0,Math.min(1,(startedOpen?1:0)+distance/EDGE_DOCK_TRAVEL));
}

export function settleEdgeGesture(dx,elapsedMs,startedOpen,openingDirection=1){
 const velocity=(startedOpen?dx:dx*openingDirection)/Math.max(1,elapsedMs);
 if(Math.abs(dx)>=18&&Math.abs(velocity)>.35)return velocity>0;
 return edgeGestureProgress(dx,startedOpen,openingDirection)>=.5;
}
