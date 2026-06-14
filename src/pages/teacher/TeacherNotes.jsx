import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, FilePenLine, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { teacherService } from '../../services/teacherService';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingState, EmptyState } from '../../components/ui/StateViews';
import { MetricCard } from '../../components/ui/MetricCard';
import { FilterTabs } from '../../components/ui/FilterTabs';
import { SearchInput } from '../../components/ui/SearchInput';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { useI18n } from '../../i18n';
import { displayName } from '../../utils/localization';

const emptyForm = {
  studentId: '',
  sessionId: '',
  severity: 'Medium',
  category: 'General',
  text: '',
};

export default function TeacherNotes() {
  const { t, language } = useI18n();
  const { user } = useAuthStore();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    teacherService.getNotesPage(user.id).then(data => {
      if (cancelled) return;
      setPage(data);
      setNotes(data.notes);
      setSelectedNoteId(data.notes[0]?.id || '');
      setForm(current => ({ ...current, studentId: data.students[0]?.id || '', sessionId: data.sessions[0]?.id || '' }));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const filteredNotes = useMemo(() => {
    if (!page) return [];
    return notes.filter(note => {
      const matchesFilter = filter === 'all' || note.severity.toLowerCase() === filter;
      const student = page.students.find(item => item.id === note.studentId);
      const studentName = `${displayName(student, 'en')} ${displayName(student, 'ar')}`;
      const haystack = `${note.content} ${studentName} ${note.category} ${note.author}`.toLowerCase();
      const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [notes, filter, query, page]);

  if (loading && !page) return <LoadingState />;
  if (!page) return <EmptyState title="No data yet" description="Content will appear here when available." />;

  const selectedNote = notes.find(note => note.id === selectedNoteId) || filteredNotes[0] || null;

  const resetForm = () => {
    setForm({ studentId: page.students[0]?.id || '', sessionId: page.sessions[0]?.id || '', severity: 'Medium', category: 'General', text: '' });
    setEditingId('');
  };

  const onSave = async () => {
    setError('');
    setFeedback('');
    if (!form.text.trim()) {
      setError('Write teacher observation...');
      return;
    }
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    const payload = {
      id: editingId || `note_local_${Date.now()}`,
      author: 'Mona Hassan',
      authorRole: 'teacher',
      studentId: form.studentId,
      sessionId: form.sessionId,
      severity: form.severity,
      severityTone: form.severity === 'High' ? 'critical' : form.severity === 'Medium' ? 'warning' : 'stable',
      category: form.category,
      content: form.text.trim(),
      timestampLabel: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setNotes(current => editingId ? current.map(note => note.id === editingId ? payload : note) : [payload, ...current]);
    setSelectedNoteId(payload.id);
    setSaving(false);
    setFeedback(editingId ? 'Note updated successfully.' : 'Note saved successfully.');
    resetForm();
  };

  const onEdit = note => {
    setEditingId(note.id);
    setSelectedNoteId(note.id);
    setForm({
      studentId: note.studentId,
      sessionId: note.sessionId || page.sessions[0]?.id || '',
      severity: note.severity,
      category: note.category,
      text: note.content,
    });
    setFeedback('');
    setError('');
  };

  const onDelete = noteId => {
    setNotes(current => current.filter(note => note.id !== noteId));
    if (editingId === noteId) resetForm();
    if (selectedNoteId === noteId) setSelectedNoteId('');
    setFeedback('Note deleted successfully.');
  };

  return (
    <div className="grid teacher-module-page">
      <PageHeader title="Notes" subtitle="Capture classroom observations, severity, and interventions with structured teacher notes." meta={{ label: 'Last updated', value: 'just now' }} />

      <div className="grid grid-4">
        {page.summary.map(item => (
          <MetricCard key={item.label} icon={<FilePenLine />} label={item.label} value={item.value} trend={item.trend} color={item.label === 'High severity' || item.label === 'Stress notes' ? 'orange' : 'blue'} />
        ))}
      </div>

      <div className="grid teacher-notes-layout">
        <Card>
          <div className="teacher-section-head compact">
            <div>
              <h2>{t('Add Session Note')}</h2>
              <p className="small muted">{t('Session and student observations')}</p>
            </div>
          </div>

          <div className="grid">
            <div className="form-row">
              <label>
                <span>{t('Students')}</span>
                <select className="select" value={form.studentId} onChange={event => setForm(current => ({ ...current, studentId: event.target.value }))}>
                  {page.students.map(student => <option key={student.id} value={student.id}>{displayName(student, language)}</option>)}
                </select>
              </label>
              <label>
                <span>{t('Sessions')}</span>
                <select className="select" value={form.sessionId} onChange={event => setForm(current => ({ ...current, sessionId: event.target.value }))}>
                  {page.sessions.map(session => <option key={session.id} value={session.id}>{t(session.title)}</option>)}
                </select>
              </label>
            </div>

            <div className="form-row">
              <label>
                <span>{t('Severity')}</span>
                <select className="select" value={form.severity} onChange={event => setForm(current => ({ ...current, severity: event.target.value }))}>
                  {['Low', 'Medium', 'High'].map(item => <option key={item} value={item}>{t(item)}</option>)}
                </select>
              </label>
              <label>
                <span>{t('Category')}</span>
                <select className="select" value={form.category} onChange={event => setForm(current => ({ ...current, category: event.target.value }))}>
                  {['Attention', 'Stress', 'Engagement', 'Behavior', 'General'].map(item => <option key={item} value={item}>{t(item)}</option>)}
                </select>
              </label>
            </div>

            <label>
              <span>{t('Notes')}</span>
              <textarea className={error ? 'textarea-error' : ''} placeholder={t('Write teacher observation...')} rows={7} value={form.text} onChange={event => setForm(current => ({ ...current, text: event.target.value }))} />
            </label>

            {error && <div className="auth-alert error">{t(error)}</div>}
            {feedback && <div className="auth-alert info"><CheckCircle2 size={15} /> {t(feedback)}</div>}

            <div className="teacher-action-row">
              <Button loading={saving} onClick={onSave}>{t('Save Note')}</Button>
              {editingId && <Button variant="outline" onClick={resetForm}>{t('Cancel edit')}</Button>}
            </div>
          </div>
        </Card>

        <Card>
          <div className="teacher-section-head compact">
            <div>
              <h2>{t('Recent Notes')}</h2>
              <p className="small muted">{t('Session and student observations')}</p>
            </div>
          </div>
          {selectedNote && (
            <div className="teacher-surface-list teacher-note-preview">
              <div className="teacher-note-card-head">
                <div className="teacher-note-badges">
                  <StatusBadge status={selectedNote.severityTone || (selectedNote.severity === 'High' ? 'critical' : selectedNote.severity === 'Medium' ? 'warning' : 'stable')}>{selectedNote.severity}</StatusBadge>
                  <StatusBadge status="blue">{selectedNote.category}</StatusBadge>
                </div>
                <span>{t(selectedNote.timestampLabel)}</span>
              </div>
              <b>{displayName(page.students.find(item => item.id === selectedNote.studentId), language) || t('Assigned Students')}</b>
              <p>{t(selectedNote.content)}</p>
            </div>
          )}
          <div className="teacher-section-actions teacher-section-actions-block">
            <FilterTabs items={[['all', 'All'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']]} active={filter} onChange={setFilter} />
            <SearchInput value={query} onChange={event => setQuery(event.target.value)} placeholder="Search students, sessions, reports..." className="teacher-inline-search" />
          </div>

          <div className="teacher-card-stack">
            {filteredNotes.length ? filteredNotes.map(note => {
              const student = page.students.find(item => item.id === note.studentId);
              return (
                <div key={note.id} className="teacher-note-card">
                  <div className="teacher-note-card-head">
                    <div className="teacher-note-badges">
                      <StatusBadge status={note.severityTone || (note.severity === 'High' ? 'critical' : note.severity === 'Medium' ? 'warning' : 'stable')}>{note.severity}</StatusBadge>
                      <StatusBadge status="blue">{note.category}</StatusBadge>
                    </div>
                    <span>{t(note.timestampLabel)}</span>
                  </div>
                  <b>{displayName(student, language) || t('Assigned Students')}</b>
                  <p>{t(note.content)}</p>
                  <div className="teacher-note-meta">
                    <span>{t(note.author)}</span>
                  </div>
                  <div className="teacher-action-row">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedNoteId(note.id); setFeedback(''); }}>{t('View')}</Button>
                    <Button variant="outline" size="sm" onClick={() => onEdit(note)}>{t('Edit')}</Button>
                    <Button variant="outline" size="sm" onClick={() => onDelete(note.id)}><Trash2 size={14} />{t('Delete')}</Button>
                  </div>
                </div>
              );
            }) : <EmptyState title="No results found" description="Try a different note filter or search query." />}
          </div>
        </Card>
      </div>
    </div>
  );
}
