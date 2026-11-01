import {ListTodo,CheckCheck,Timer,Table2,CalendarDays,NotebookPen,FolderPlus} from 'lucide-react';

const presentations={
 tasks:{icon:ListTodo,description:'editorTaskDescription'},
 habits:{icon:CheckCheck,description:'editorHabitDescription'},
 subjects:{icon:Timer,description:'editorFocusDescription'},
 timeblocks:{icon:Table2,description:'editorScheduleDescription'},
 calendar:{icon:CalendarDays,description:'editorCalendarDescription'},
 notes:{icon:NotebookPen,description:'editorNoteDescription'},
 folder:{icon:FolderPlus,description:'editorFolderDescription'}
};

export function creationPresentation(kind,t){
 const presentation=presentations[kind];
 return presentation&&t?{Icon:presentation.icon,description:t(presentation.description)}:null;
}
