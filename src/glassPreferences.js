export const DEFAULT_GLASS_TRANSPARENCY=55;
export const MAX_GLASS_TRANSPARENCY=200;

export function normalizeGlassTransparency(value){
 return typeof value==='number'&&Number.isFinite(value)?Math.max(0,Math.min(MAX_GLASS_TRANSPARENCY,Math.round(value))):DEFAULT_GLASS_TRANSPARENCY;
}

export function glassSurfaceStyles(transparency){
 const value=normalizeGlassTransparency(transparency);
 const extraClarity=Math.max(0,value-100)/100;
 // Preserve the original range; higher levels clear the reflections and frost.
 return {
  '--glass-surface-opacity':Math.max(0,100-value)+'%',
  '--glass-reflection-opacity':Math.round(100-extraClarity*80)+'%',
  '--glass-blur-multiplier':String(Number((1-extraClarity*.7).toFixed(3)))
 };
}
