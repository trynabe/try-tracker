export const accentPresets={violet:'#6255e7',indigo:'#4f46e5',blue:'#2563eb',cyan:'#0891b2',green:'#059669',yellow:'#a87905',orange:'#c65b16',red:'#dc2626',pink:'#db2777'};
export const safeAccent=value=>typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value)?value.toLowerCase():'';
export function accentSettings(profile){
 const customAccent=safeAccent(profile.customAccent);
 if(profile.accent==='rainbow')return {accent:'custom',customAccent:customAccent||'#9952ce'};
 return {accent:Object.hasOwn(accentPresets,profile.accent)?profile.accent:profile.accent==='custom'&&customAccent?'custom':'violet',customAccent:customAccent||accentPresets.violet};
}
export function accentColor(profile){const settings=accentSettings(profile);return settings.accent==='custom'?settings.customAccent:accentPresets[settings.accent];}
export function accentContrast(hex){
 const color=safeAccent(hex)||accentPresets.violet;
 const channels=[1,3,5].map(index=>parseInt(color.slice(index,index+2),16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);
 const luminance=channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;
 return luminance>.179?'#111827':'#ffffff';
}
