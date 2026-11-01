import React from 'react';
import {ChevronRight,Languages,Settings} from 'lucide-react';
import ProfileImage from './ProfileImage';
import {EntityIcon} from './icons';
import {APP_VERSION_LABEL} from './release.js';

export default function DesktopTopbar({page,t,demo,busy,language,profile,onNavigate,onChangeLanguage}){
 const status=busy?t('saving'):demo?t('demo'):t('synced');
 return <header className="topbar desktop-topbar">
  <div className="desktop-header-identity">
   <div className="desktop-header-brandline">
    <span className="desktop-header-wordmark">Try-Tracker<span aria-hidden="true"/></span>
    <span className="desktop-header-preview">{APP_VERSION_LABEL}</span>
   </div>
   <div className="desktop-header-location"><span>{t('workspace')}</span><ChevronRight size={11} aria-hidden="true"/><strong>{t(page)}</strong></div>
  </div>
  <div className="desktop-header-actions">
   <span className="desktop-save-status" data-state={busy?'saving':demo?'demo':'synced'} role="status" aria-label={status} title={status}><i aria-hidden="true"/><span aria-hidden="true">{status}</span></span>
   <div className="desktop-header-controls">
    <button type="button" className="desktop-language" disabled={busy} onClick={onChangeLanguage} aria-label={t('language')+': '+(language==='th'?'TH':'EN')} title={t('language')+' · '+(language==='th'?'English':'ไทย')}><Languages size={16} aria-hidden="true"/><span>{language==='th'?'TH':'EN'}</span></button>
    <span className="desktop-header-divider" aria-hidden="true"/>
    <button type="button" className={'desktop-account-button desktop-profile-button'+(page==='profile'?' active':'')} onClick={()=>onNavigate('profile')} aria-label={t('profile')} title={profile.name||t('profile')} aria-current={page==='profile'?'page':undefined}>{profile.photo?<ProfileImage src={profile.photo} crop={profile.photoCrop}/>:<EntityIcon value="user" size={21}/>}</button>
    <button type="button" className={'desktop-account-button'+(page==='settings'?' active':'')} onClick={()=>onNavigate('settings')} aria-label={t('settings')} title={t('settings')} aria-current={page==='settings'?'page':undefined}><Settings size={20} strokeWidth={1.7} aria-hidden="true"/></button>
   </div>
  </div>
 </header>;
}
