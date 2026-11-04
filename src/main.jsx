import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import {uiVariantForPath} from './release.js';
import './styles.css';
import './habitkit.css';
import './spacing.css';
import './desktop26.css';
import './creationDialogs.css';
import './mobile26.css';
import './settings.css';
import './glass.css';
import './taskToolbar.css';
import './dialogMotion.css';

const uiVariant=uiVariantForPath(location.pathname);
document.documentElement.dataset.ui=uiVariant;

class Boundary extends React.Component {
 state={error:false};
 static getDerivedStateFromError(){return {error:true};}
 render(){return this.state.error?<main className="fatal"><h1>Try-Tracker</h1><p>เกิดข้อผิดพลาด กรุณารีเฟรชหน้า / Something went wrong. Please reload.</p><button onClick={()=>location.reload()}>รีเฟรช / Reload</button></main>:this.props.children;}
}
createRoot(document.getElementById('root')).render(<Boundary><App uiVariant={uiVariant}/></Boundary>);
