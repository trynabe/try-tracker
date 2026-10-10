import React from 'react';

export default function DateInput({className='',...props}){
 return <span className={'native-date-field'+(className?' '+className:'')}><input {...props} type="date"/></span>;
}
