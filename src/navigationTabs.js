export function navigationTabs(tabs,nav){
 const available=[...new Set(nav.map(([key])=>key))];
 const visible=[...new Set([...(tabs||[]),...available])].filter(key=>available.includes(key)).slice(0,3);
 return {visible,overflow:available.filter(key=>!visible.includes(key))};
}
