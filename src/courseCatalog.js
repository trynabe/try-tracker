// Course names transcribed from the user's MyCourses dashboard screenshot.
export const defaultCourseCatalog=[
 {code:'ITDS211',name:'Computer Architecture and Operating Systems'},
 {code:'ITDS212',name:'Computer System Lab'},
 {code:'ITDS231',name:'Computer Networks'},
 {code:'ITDS232',name:'Computer Network Lab'},
 {code:'ITDS241',name:'Web Technologies and Applications'},
 {code:'ITDS242',name:'Web Technologies Lab'},
 {code:'ITDS261',name:'Introduction to Software Engineering'},
 {code:'ITDS262',name:'Software Engineering Lab'},
 {code:'ITDS294',name:'Fundamentals of Electronic Commerce Systems'},
 {code:'ITLG201',name:'Reading Skills'},
];

export function normalizeCourseCatalog(rows=[]){
 const courses=new Map(defaultCourseCatalog.map(course=>[course.code,course]));
 for(const row of rows){
  const code=typeof row?.code==='string'?row.code.trim().toUpperCase():'';
  const name=typeof row?.name==='string'?row.name.trim():'';
  if(/^[A-Z]{2,8}\d{3}$/.test(code)&&name&&name.length<=300)courses.set(code,{code,name});
 }
 return [...courses.values()];
}

export function courseForEvent(event,catalog=defaultCourseCatalog){
 // Only summary/categories identify a course. A room like IT304 in a
 // description, or a numeric Moodle UID, must never become a course code.
 const prefixes=new Set([...defaultCourseCatalog,...catalog].map(course=>course.code.replace(/\d+$/,'')));
 const codes=new Set();
 for(const content of [event.title,event.category]){
  for(const match of String(content||'').matchAll(/(?:^|[^A-Z0-9])([A-Z]{2,8})([ _-]*)(\d{3})(?=$|[^A-Z0-9])/gi)){
   const prefix=match[1].toUpperCase();
   if(!match[2]||prefixes.has(prefix))codes.add(prefix+match[3]);
  }
 }
 if(codes.size!==1)return null;
 const code=[...codes][0];
 return catalog.find(course=>course.code===code)||{code,name:''};
}

export function calendarEventTitle(event,catalog=defaultCourseCatalog){
 const course=courseForEvent(event,catalog);
 if(!course?.name)return event.title;
 const original=String(event.title||'');
 if(original.toLowerCase().includes(course.name.toLowerCase()))return original;
 const simple=original.match(new RegExp('^(\\[[^\\]]+\\]\\s*[-–:]?\\s*)?(?:\\d{2,4}[ _-])?'+course.code+'$','i'));
 return simple?(simple[1]?simple[1].replace(/[\s\-–:]+$/,'')+' · ':'')+course.code+' · '+course.name:original+' · '+course.name;
}

export function coursesForImports(events=[],catalog=defaultCourseCatalog){
 const courses=new Map();
 for(const event of events){
  const course=courseForEvent(event,catalog);
  if(course)courses.set(course.code,course);
 }
 return [...courses.values()].sort((a,b)=>a.code.localeCompare(b.code));
}

// Recognize the older weekly class titles as well as official catalog names.
const weeklyCourseAliases={
 ITDS211:['Computer Architecture','Computer Architecture Lectures'],
 ITDS212:['Computer Systems Lab'],
 ITDS231:['Computer Network','Computer Network Lectures','Computer Networks Lectures'],
 ITDS241:['Website Technology','Website Technology Lectures','Web Technologies and Applications Lectures'],
 ITDS242:['Website Technology Lab'],
 ITDS261:['Software Engineering','Software Engineering Lectures'],
 ITDS294:['Electric Commerce Lectures','Electric Commerce Lab','Electronic Commerce Lectures','Electronic Commerce Lab'],
};
const courseTitleKey=value=>String(value||'').trim().toLowerCase().replace(/[ _-]+/g,' ');
export function courseForSchedule(item,catalog=defaultCourseCatalog){
 const coded=courseForEvent(item,catalog);
 if(coded)return coded;
 const title=courseTitleKey(item.title);
 const matches=catalog.filter(course=>[course.name,...(weeklyCourseAliases[course.code]||[])].some(name=>courseTitleKey(name)===title));
 return matches.length===1?matches[0]:null;
}
