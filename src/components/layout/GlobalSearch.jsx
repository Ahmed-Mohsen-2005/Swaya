import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useI18n } from '../../i18n';
import { useAuthStore } from '../../store/authStore';
import { searchService } from '../../services/searchService';

export function GlobalSearch({ className = '' }) {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const nav = useNavigate();
  const wrapRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!query.trim()) {
        setResults([]);
        setOpen(false);
        return;
      }
      searchService.search(query, user?.role).then(items => {
        if (cancelled) return;
        setResults(items);
        setActive(0);
        setOpen(true);
      });
    }, 120);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query, user?.role]);

  useEffect(() => {
    function onPointerDown(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const go = result => {
    if (!result) return;
    setOpen(false);
    setQuery('');
    nav(result.href);
  };

  const onKeyDown = event => {
    if (event.key === 'Escape') setOpen(false);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive(index => Math.min(index + 1, results.length - 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive(index => Math.max(index - 1, 0));
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      go(results[active]);
    }
  };

  const grouped = results.reduce((acc, item) => {
    acc[item.category] ||= [];
    acc[item.category].push(item);
    return acc;
  }, {});
  let runningIndex = -1;

  return (
    <div className={`global-search-wrap ${className}`} ref={wrapRef}>
      <label className="search-input">
        <Search size={16}/>
        <input value={query} onChange={event => setQuery(event.target.value)} onFocus={() => query && setOpen(true)} onKeyDown={onKeyDown} placeholder={t('Search students, sessions, reports…')} aria-label={t('Search students, sessions, reports…')}/>
      </label>
      <AnimatePresence>
        {open && (
          <motion.div className="search-results" role="listbox" initial={{ opacity: 0, y: -5, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }} transition={{ duration: 0.14 }}>
            {results.length === 0 ? <div className="search-empty">{t('No results found')}</div> : Object.entries(grouped).map(([category, items]) => (
              <div className="search-group" key={category}>
                <div className="search-group-label">{t(category)}</div>
                {items.map(item => {
                  runningIndex += 1;
                  const itemIndex = runningIndex;
                  return <button className={itemIndex === active ? 'active' : ''} role="option" aria-selected={itemIndex === active} key={`${item.href}-${item.title}`} onMouseEnter={() => setActive(itemIndex)} onClick={() => go(item)}><b>{t(item.title)}</b><span>{t(item.description)}</span></button>;
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
