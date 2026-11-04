import React from 'react';

export default function SettingsSectionHeading({icon:Icon,title,description,badge,id}){
 return <div className="settings-section-heading">
  <span className="settings-section-icon" aria-hidden="true"><Icon size={20} strokeWidth={1.7}/></span>
  <div className="settings-section-copy"><h2 id={id}>{title}</h2>{description&&<p>{description}</p>}</div>
  {badge!=null&&<span className="settings-section-badge">{badge}</span>}
 </div>;
}
