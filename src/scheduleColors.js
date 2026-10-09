export const normalizeScheduleColor=value=>typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value)?value.toLowerCase():'';

export function categoryColor(name=''){
 let hash=0;
 for(const character of name)hash=((hash<<5)-hash)+character.charCodeAt(0);
 return 'hsl('+Math.abs(hash)%360+', 60%, 46%)';
}

export const scheduleColor=block=>normalizeScheduleColor(block.color)||categoryColor(block.category||'');
