import React from 'react';
import {Search, X, Flag, Clock} from 'lucide-react';

export default function TaskToolbar({tasks, today, taskFilter, setTaskFilter, query, setQuery, t}) {
  const matchingTasks = tasks.filter(task => (task.text + ' ' + task.tag).toLowerCase().includes(query.toLowerCase()));
  const counts = {
    all: matchingTasks.length,
    active: matchingTasks.filter(task => !task.done).length,
    completed: matchingTasks.filter(task => task.done).length,
    high: matchingTasks.filter(task => task.priority === 'high').length,
    overdue: matchingTasks.filter(task => !task.done && task.dueDate && task.dueDate < today).length,
  };
  const filterButton = (key, Icon) => {
    const label = t(key === 'high' ? 'highPriority' : key);
    return <button
      type="button"
      key={key}
      className={(Icon ? 'task-quick-filter ' : '') + (taskFilter === key ? 'selected' : '')}
      aria-label={label}
      aria-pressed={taskFilter === key}
      onClick={() => setTaskFilter(key)}
    >
      {Icon && <Icon size={16} aria-hidden="true"/>}
      <span className="task-filter-label">{label}</span>
      <span className="task-filter-count" aria-hidden="true">{counts[key]}</span>
    </button>;
  };

  return <div className="toolbar wrap task-toolbar">
    <div className="task-filter-groups">
      <div className="filter-pills task-status-filters" role="group" aria-label={t('taskStatus')}>
        {['all', 'active', 'completed'].map(key => filterButton(key))}
      </div>
      <div className="filter-pills task-quick-filters" role="group" aria-label={t('taskFilters')}>
        {filterButton('high', Flag)}
        {filterButton('overdue', Clock)}
      </div>
    </div>
    <div className="search-input task-search">
      <Search size={18} aria-hidden="true"/>
      <input type="search" aria-label={t('searchTasks')} placeholder={t('searchTasks')} value={query} onChange={e => setQuery(e.target.value)}/>
      {query && <button type="button" className="task-search-clear" aria-label={t('clearSearch')} onClick={() => setQuery('')}><X size={16} aria-hidden="true"/></button>}
    </div>
  </div>;
}
