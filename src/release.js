export const APP_VERSION_LABEL='2.8';

// Keep the original interface available for comparison and preserve existing preview links.
export function uiVariantForPath(pathname=''){
 return /^\/classic\/?$/.test(pathname)?'classic':'v26';
}
