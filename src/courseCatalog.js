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
