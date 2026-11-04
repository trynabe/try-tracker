import React,{useEffect,useId,useMemo,useRef,useState} from 'react';
import {Activity,CheckCheck,ListTodo,Timer,Target,Flame,ChevronLeft,ChevronRight,ArrowUpRight,ArrowDownRight,Minus} from 'lucide-react';
import {tier,statistics,shiftDate} from './domain.js';
import {dayNames} from './i18n.js';
import {dailyInsightSeries} from './insightSeries.js';
import './insightsDashboard.css';

const metrics=[
 {key:'habits',label:'habitRate',tab:'habits',icon:CheckCheck,color:'cyan'},
 {key:'tasks',label:'tasksProgress',tab:'tasks',icon:ListTodo,color:'green'},
 {key:'focus',label:'insightsFocusTime',tab:'focus',icon:Timer,color:'violet'}
];
const number=(value,language)=>new Intl.NumberFormat(language==='th'?'th-TH':'en-US',{maximumFractionDigits:1}).format(value);
const dateText=(date,language,long=false)=>new Date(date+'T12:00:00').toLocaleDateString(language==='th'?'th-TH':'en-US',{day:'numeric',month:long?'long':'short',...(long?{year:'numeric'}:{})});
const totalFor=(stats,metric)=>metric==='habits'?stats.habitRate:metric==='tasks'?stats.tasksDone:stats.focusMinutes;
const valueText=(value,metric,t,language)=>value==null?t('insightsNoScheduledHabits'):number(value,language)+(metric==='habits'?'%':' '+t(metric==='focus'?'minutes':'insightsTaskUnit'));

function axisMaximum(peak,metric){
 if(metric==='habits')return 100;
 if(!peak)return metric==='tasks'?4:60;
 const raw=peak/4,magnitude=10**Math.floor(Math.log10(raw));
 const step=[1,2,2.5,5,10].find(value=>value*magnitude>=raw)*magnitude;
 return Math.max(metric==='tasks'?4:1,step*4);
}

// Each control point stays between its two observations, so smoothing adds no false peaks.
function curve(points){
 return points.map((point,index)=>{
  if(!index)return `M${point.x},${point.y}`;
  const previous=points[index-1],middle=(previous.x+point.x)/2;
  return `C${middle},${previous.y} ${middle},${point.y} ${point.x},${point.y}`;
 }).join(' ');
}
function segments(points){
 const result=[];let part=[];
 for(const point of points){
  if(point.value==null){if(part.length)result.push(part);part=[];}
  else part.push(point);
 }
 if(part.length)result.push(part);
 return result;
}
function usePlotWidth(ref){
 const [width,setWidth]=useState(760);
 useEffect(()=>{const node=ref.current;if(!node)return;const observer=new ResizeObserver(([entry])=>setWidth(Math.max(180,entry.contentRect.width)));observer.observe(node);return()=>observer.disconnect();},[ref]);
 return width;
}

export function InsightsRange({value,onChange,t}){
 return <div className="segmented compact insights-range" role="group" aria-label={t('insightsDateRange')}>
  {[7,30].map(days=><button key={days} type="button" aria-pressed={value===days} className={value===days?'selected':''} onClick={()=>onChange(days)}>{t('days'+days)}</button>)}
 </div>;
}

function MiniTrend({series,metric,id}){
 const width=240,height=62,max=axisMaximum(Math.max(0,...series.map(point=>point[metric]??0)),metric);
 const points=series.map((point,index)=>({value:point[metric],x:3+index/Math.max(1,series.length-1)*234,y:4+(1-(point[metric]??0)/max)*50}));
 return <svg className="insights-mini-trend" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
  <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".22"/><stop offset="1" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs>
  <line x1="0" x2={width} y1="55" y2="55" className="insights-mini-baseline"/>
  {segments(points).map((part,index)=><g key={index}><path d={curve(part)+` L${part.at(-1).x},60 L${part[0].x},60 Z`} fill={`url(#${id})`}/><path d={curve(part)} fill="none" stroke="currentColor" strokeWidth="2.3" vectorEffect="non-scaling-stroke"/>{part.length===1&&<circle cx={part[0].x} cy={part[0].y} r="2.5" fill="currentColor"/>}</g>)}
 </svg>;
}

function MetricCard({item,stats,series,selected,onSelect,t,language,id}){
 const Icon=item.icon;
 return <button type="button" className={`insights-metric-card insight-${item.color}${selected?' is-selected':''}`} aria-pressed={selected} aria-label={t('insightsShowMetric')+': '+t(item.label)} aria-describedby={id+'-value'} onClick={onSelect}>
  <div className="insights-metric-card-top"><span><Icon size={16}/>{t(item.label)}</span><ArrowUpRight size={15} aria-hidden="true"/></div>
  <div className="insights-metric-value" id={id+'-value'}><strong>{number(totalFor(stats,item.key),language)}</strong><span>{item.key==='habits'?'%':t(item.key==='focus'?'minutes':'insightsTaskUnit')}</span></div>
  <MiniTrend {...{series,id}} metric={item.key}/>
  <span className="insights-metric-caption">{t('insightsDailyTrend')}<span>{t('days'+series.length)}</span></span>
 </button>;
}

function OverviewCards({stats,t,language}){
 const radius=52,circumference=2*Math.PI*radius;
 return <aside className="insights-summary-column">
  <section className="panel insights-score-panel" aria-label={t('score')}>
   <div className="insights-card-label"><span><Target size={16}/>{t('score')}</span><span className="insights-small-label">{t('insightsPeriodSnapshot')}</span></div>
   <div className="insights-score-ring"><svg viewBox="0 0 132 132" aria-hidden="true"><circle className="insights-ring-track" cx="66" cy="66" r={radius}/><circle className="insights-ring-value" cx="66" cy="66" r={radius} strokeDasharray={`${circumference*stats.score/100} ${circumference}`} transform="rotate(-90 66 66)"/><circle className="insights-ring-inner" cx="66" cy="66" r="42"/></svg><div><strong>{stats.score}</strong><span>/ 100</span></div></div>
   <span className="insights-level-label">{t('level'+tier(stats.score))}</span>
   <p className="insights-score-caption">{t('insightsScoreCaption')}</p>
  </section>
  <section className="panel insights-best-panel"><span className="insights-best-icon"><Flame size={20}/></span><div><h2>{t('bestDay')}</h2><strong>{stats.bestDay===null?'—':dayNames[language][stats.bestDay]}</strong><p>{t('insightsBestDayCaption')}</p></div></section>
 </aside>;
}

function TrendChart({stats,previousStats,series,previousSeries,metric,setMetric,t,language}){
 const [active,setActive]=useState(null);
 const plot=useRef(null),pointRefs=useRef([]),id=useId(),width=usePlotWidth(plot);
 const rangeKey=series.map(point=>point.date).join('|');
 useEffect(()=>{setActive(null);},[metric,rangeKey]);
 const selected=metrics.find(item=>item.key===metric),SelectedIcon=selected.icon;
 const max=axisMaximum(Math.max(0,...series.map(point=>point[metric]??0),...previousSeries.map(point=>point[metric]??0)),metric);
 const height=230,left=40,right=16,top=20,bottom=30,plotWidth=width-left-right,plotHeight=height-top-bottom,step=plotWidth/Math.max(1,series.length-1);
 const toPoints=source=>source.map((point,index)=>({...point,value:point[metric],x:left+(source.length===1?plotWidth/2:index*step),y:top+(1-(point[metric]??0)/max)*plotHeight}));
 const points=toPoints(series),previousPoints=toPoints(previousSeries);
 const shownIndex=Math.max(0,Math.min(active??points.length-1,points.length-1)),shown=points[shownIndex],previousShown=previousPoints[shownIndex];
 const hasData=source=>metric==='habits'?source.some(point=>point.habits!==null):source.some(point=>point[metric]>0);
 const empty=!hasData(series)&&!hasData(previousSeries);
 const total=totalFor(stats,metric),previousTotal=totalFor(previousStats,metric),delta=total-previousTotal,DeltaIcon=delta>0?ArrowUpRight:delta<0?ArrowDownRight:Minus;
 const comparable=metric!=='habits'||previousSeries.some(point=>point.habits!==null);
 const labelCount=width<430?3:5;
 const labelIndexes=new Set(Array.from({length:Math.min(series.length,labelCount)},(_,index)=>Math.round(index*(series.length-1)/(Math.min(series.length,labelCount)-1))));
 const move=(next,focus=false)=>{const index=Math.max(0,Math.min(points.length-1,next));setActive(index);if(focus)pointRefs.current[index]?.focus({preventScroll:true});};
 const inspect=index=>setActive(index);
 const keys=(event,index)=>{const next={ArrowLeft:index-1,ArrowRight:index+1,Home:0,End:points.length-1}[event.key];if(next!==undefined){event.preventDefault();move(next,true);}};
 const format=value=>valueText(value,metric,t,language);
 return <section className="panel insights-performance" aria-labelledby={id+'-title'}>
  <header className="insights-performance-heading"><div><h2 id={id+'-title'}><Activity size={17}/>{t('insightsPerformance')}</h2><p>{series.length?dateText(series[0].date,language)+' – '+dateText(series.at(-1).date,language):t('noData')}</p></div><div className="insights-chart-switches" role="group" aria-label={t('insightsChartMetric')}>{metrics.map(({key,label,tab})=><button key={key} type="button" aria-label={t(label)} aria-pressed={key===metric} className={key===metric?'selected':''} onClick={()=>setMetric(key)}>{t(tab)}</button>)}</div></header>
  <div className="insights-performance-summary"><div><span>{t(selected.label)}</span><strong>{format(total)}</strong></div><div className="insights-comparison-summary">{comparable?<><span className={'insights-delta '+(delta>0?'positive':delta<0?'negative':'neutral')}><DeltaIcon size={14}/>{delta>0?'+':delta<0?'−':''}{number(Math.abs(delta),language)} {metric==='habits'?t('insightsPercentagePoints'):t(metric==='focus'?'minutes':'insightsTaskUnit')}</span><span>{t('insightsVersusPrevious')}</span></>:<span>{t('insightsNoPreviousData')}</span>}</div></div>
  <div className="insights-chart-legend"><span><i/>{t('insightsCurrentPeriod')}</span><span><i/>{t('insightsPreviousPeriod')}</span></div>
  <div className="insights-line-plot" ref={plot}>
   <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
    <defs>{['current','previous'].map(kind=><linearGradient id={id+'-'+kind} key={kind} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={kind==='current'?'var(--insight-cyan)':'var(--insight-green)'} stopOpacity={kind==='current'?'.36':'.20'}/><stop offset="1" stopColor={kind==='current'?'var(--insight-cyan)':'var(--insight-green)'} stopOpacity=".025"/></linearGradient>)}</defs>
    {[0,1,2,3,4].map(tick=>{const value=max*tick/4,y=top+(1-tick/4)*plotHeight;return <g key={tick} className="insights-chart-axis"><line x1={left} x2={width-right} y1={y} y2={y}/><text x={left-10} y={y+4} textAnchor="end">{number(value,language)}{metric==='habits'?'%':''}</text></g>;})}
    {points.filter((_,index)=>labelIndexes.has(index)).map(point=><line className="insights-vertical-grid" key={point.date} x1={point.x} x2={point.x} y1={top} y2={height-bottom}/>)}
    {[{points:previousPoints,kind:'previous'},{points,kind:'current'}].map(line=><g key={line.kind} className={'insights-series-'+line.kind}>{segments(line.points).map((part,index)=><g key={index}><path className="insights-series-area" d={curve(part)+` L${part.at(-1).x},${height-bottom} L${part[0].x},${height-bottom} Z`} fill={`url(#${id}-${line.kind})`}/><path className="insights-series-line" d={curve(part)} fill="none"/>{part.filter(point=>series.length<=7||point===shown||point===previousShown||part.length===1).map(point=><circle className="insights-series-dot" key={point.date} cx={point.x} cy={point.y} r="3"/>)}</g>)}</g>)}
    {active!==null&&shown&&<g className="insights-chart-cursor"><line x1={shown.x} x2={shown.x} y1={top} y2={height-bottom}/>{[{point:previousShown,kind:'previous'},{point:shown,kind:'current'}].filter(item=>item.point?.value!=null).map(({point,kind})=><g className={'insights-series-'+kind} key={kind}><circle className="insights-cursor-halo" cx={point.x} cy={point.y} r="8"/><circle className="insights-series-dot" cx={point.x} cy={point.y} r="4"/></g>)}</g>}
    {points.filter((_,index)=>labelIndexes.has(index)).map(point=><text className="insights-x-label" key={point.date} x={point.x} y={height-7} textAnchor={point===points[0]?'start':point===points.at(-1)?'end':'middle'}>{dateText(point.date,language)}</text>)}
   </svg>
   <p className="visually-hidden" id={id+'-help'}>{t('insightsChartKeys')}</p>
   {points.map((point,index)=><button key={point.date} ref={node=>{pointRefs.current[index]=node;}} type="button" className="insights-point-hit" aria-label={dateText(point.date,language,true)+': '+format(point.value)+(previousPoints[index]?', '+t('insightsPreviousPeriod')+' '+dateText(previousPoints[index].date,language)+': '+format(previousPoints[index].value):'')} aria-describedby={id+'-help'} tabIndex={index===shownIndex?0:-1} style={{left:Math.max(left,point.x-step/2)/width*100+'%',width:(Math.min(width-right,point.x+step/2)-Math.max(left,point.x-step/2))/width*100+'%'}} onPointerEnter={()=>inspect(index)} onFocus={()=>inspect(index)} onClick={()=>inspect(index)} onKeyDown={event=>keys(event,index)}/>)}
   {empty&&<div className="insights-chart-empty"><SelectedIcon size={22}/><span>{t({habits:'insightsEmptyHabits',tasks:'insightsEmptyTasks',focus:'insightsEmptyFocus'}[metric])}</span></div>}
  </div>
  <footer className="insights-point-detail"><div aria-live="polite" aria-atomic="true"><span>{shown?dateText(shown.date,language,true):'—'}</span><strong>{shown?format(shown.value):'—'}</strong><small>{previousShown?t('insightsPreviousPeriod')+': '+format(previousShown.value):''}</small></div><div className="insights-point-controls"><button type="button" aria-label={t('insightsPreviousPoint')} disabled={shownIndex<=0} onClick={()=>move(shownIndex-1)}><ChevronLeft size={16}/></button><button type="button" aria-label={t('insightsNextPoint')} disabled={shownIndex>=points.length-1} onClick={()=>move(shownIndex+1)}><ChevronRight size={16}/></button></div></footer>
 </section>;
}

export function WeeklyOverview({data,today,t,language,onOpenInsights}){
 const [metric,setMetric]=useState('habits');
 const {stats,previousStats,series,previousSeries}=useMemo(()=>{
  const stats=statistics(data,7,today),previousStats=statistics(data,7,shiftDate(today,-7));
  return {stats,previousStats,series:dailyInsightSeries(stats),previousSeries:dailyInsightSeries(previousStats)};
 },[data,today]);
 return <div className="insights-dashboard today-weekly-overview">
  <TrendChart {...{stats,previousStats,series,previousSeries,metric,setMetric,t,language}}/>
  <button type="button" className="text-btn weekly-insights-link" onClick={onOpenInsights}>{t('insightsViewAll')}<ArrowUpRight size={15} aria-hidden="true"/></button>
 </div>;
}

export default function InsightsDashboard({stats,previousStats,t,language}){
 const [metric,setMetric]=useState('habits'),id=useId();
 const series=useMemo(()=>dailyInsightSeries(stats),[stats.trend,stats.completedTasks,stats.sessions]);
 const previousSeries=useMemo(()=>dailyInsightSeries(previousStats),[previousStats]);
 return <div className="insights-dashboard">
  <div className="insights-dashboard-top"><TrendChart {...{stats,previousStats,series,previousSeries,metric,setMetric,t,language}}/><OverviewCards {...{stats,t,language}}/></div>
  <div className="insights-metric-cards" role="group" aria-label={t('insightsShowMetric')}>{metrics.map(item=><MetricCard key={item.key} {...{item,stats,series,t,language}} id={id+'-'+item.key} selected={metric===item.key} onSelect={()=>setMetric(item.key)}/>)}</div>
 </div>;
}
