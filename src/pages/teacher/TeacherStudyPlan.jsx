import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpenCheck, CalendarDays, CheckCircle2, Clock3, FileText, LayoutTemplate, Link2, PencilLine, Search, UploadCloud, X } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { MetricCard } from '../../components/ui/MetricCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FilterTabs } from '../../components/ui/FilterTabs';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/StateViews';
import { studyPlanTemplates } from '../../data/studyPlans';
import { useStudyPlanStore } from '../../store/studyPlanStore';
import { useAuthStore } from '../../store/authStore';
import { dataService } from '../../services/dataService';
import { useI18n } from '../../i18n';
import { displayName, localizedValue } from '../../utils/localization';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
const SOURCE_LABELS = { file: 'File', manual: 'Manual', template: 'Template' };
const STATUS_LABELS = { saved: 'Saved', used_in_session: 'Used in Session', pending_review: 'Pending Review' };
const DEFAULT_CLASS_NAME = { ar: 'صف الدمج أ', en: 'Inclusive Class A' };

const STUDENT_NAME_OVERRIDES = {
  stu_001: { ar: 'عبدالله علي', en: 'Abdullah Ali' },
  stu_002: { ar: 'سارة محمد', en: 'Sara Mohamed' },
  stu_003: { ar: 'عمر حسن', en: 'Omar Hassan' },
  stu_004: { ar: 'ليلى خالد', en: 'Layla Khaled' },
  stu_005: { ar: 'يوسف طارق', en: 'Youssef Tarek' },
  stu_006: { ar: 'نور أحمد', en: 'Noor Ahmed' },
  stu_007: { ar: 'إبراهيم سامي', en: 'Ibrahim Sami' },
  stu_008: { ar: 'هنا محمود', en: 'Hana Mahmoud' },
};

const FALLBACK_STUDENTS = Object.entries(STUDENT_NAME_OVERRIDES).map(([id, name]) => ({ id, name, fullName: name.en }));

function createEmptyForm(language = 'ar') {
  return {
    title: '',
    className: localizedValue(DEFAULT_CLASS_NAME, language),
    date: new Date().toISOString().slice(0, 10),
    duration: '40',
    goals: '',
    steps: '',
    materials: '',
    supportNotes: '',
    supportStudentIds: [],
  };
}

function localizedField(value, language) {
  return localizedValue(value, language);
}

function toLocalized(value) {
  return { ar: value, en: value };
}

function classNamePayload(value, language) {
  const trimmed = String(value || '').trim();
  if (!trimmed || trimmed === DEFAULT_CLASS_NAME.ar || trimmed === DEFAULT_CLASS_NAME.en) return DEFAULT_CLASS_NAME;
  return language === 'ar' ? { ar: trimmed, en: trimmed } : { ar: trimmed, en: trimmed };
}

function getStudentName(student, language) {
  return localizedValue(STUDENT_NAME_OVERRIDES[student?.id], language) || displayName(student, language) || student?.fullName || '';
}

function selectedStudentNames(studentIds = [], students = [], language = 'ar') {
  return studentIds
    .map(id => students.find(student => student.id === id) || FALLBACK_STUDENTS.find(student => student.id === id))
    .filter(Boolean)
    .map(student => getStudentName(student, language));
}

function planSummary(plan, language) {
  return localizedField(plan.summary, language)
    || localizedField(plan.goals, language)
    || localizedField(plan.supportNotes, language)
    || '';
}

function fileExtension(file) {
  return (file?.name?.split('.').pop() || '').toLowerCase();
}

function formatSize(size) {
  if (!size) return '0 KB';
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatPlanDate(value, language) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(`${value}T00:00:00`));
  } catch {
    return value;
  }
}

function StudentPicker({ students, selectedIds, onChange }) {
  const { t, language } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const pickerRef = useRef(null);

  useEffect(() => {
    function onPointerDown(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const selectedStudents = selectedIds
    .map(id => students.find(student => student.id === id))
    .filter(Boolean);
  const filtered = students.filter(student => getStudentName(student, language).toLowerCase().includes(query.trim().toLowerCase()));

  const toggleStudent = id => {
    onChange(selectedIds.includes(id) ? selectedIds.filter(item => item !== id) : [...selectedIds, id]);
  };

  return (
    <div className="study-plan-student-picker" ref={pickerRef}>
      <button type="button" className="study-plan-picker-trigger" onClick={() => setOpen(value => !value)} aria-expanded={open}>
        <span>{selectedIds.length ? `${selectedIds.length} ${t('selected')}` : t('Select one or more students')}</span>
        <Search size={15} />
      </button>
      <div className="study-plan-selected-chips">
        {selectedStudents.length ? selectedStudents.map(student => (
          <span className="study-plan-student-chip" key={student.id}>
            {getStudentName(student, language)}
            <button type="button" aria-label={t('Remove student')} onClick={() => toggleStudent(student.id)}><X size={12} /></button>
          </span>
        )) : <span className="study-plan-empty-chip">{t('No students selected')}</span>}
      </div>
      {open && (
        <div className="study-plan-picker-menu">
          <div className="study-plan-picker-search">
            <Search size={14} />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder={t('Search student...')} autoFocus />
          </div>
          <div className="study-plan-picker-list">
            {filtered.length ? filtered.map(student => (
              <button type="button" key={student.id} className={selectedIds.includes(student.id) ? 'selected' : ''} onClick={() => toggleStudent(student.id)}>
                <span>{getStudentName(student, language)}</span>
                {selectedIds.includes(student.id) && <CheckCircle2 size={15} />}
              </button>
            )) : <div className="study-plan-picker-empty">{t('No matching students')}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeacherStudyPlan() {
  const { t, language } = useI18n();
  const { user } = useAuthStore();
  const { plans, addPlan, updatePlan, deletePlan, useInLiveSession } = useStudyPlanStore();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [manualForm, setManualForm] = useState(() => createEmptyForm(language));
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [previewPlan, setPreviewPlan] = useState(null);
  const [students, setStudents] = useState(FALLBACK_STUDENTS);

  useEffect(() => {
    let cancelled = false;
    dataService.getStudentsForTeacher(user.id).then(items => {
      if (!cancelled) setStudents(items.length ? items : FALLBACK_STUDENTS);
    });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const latestPlan = plans[0];
  const linkedLiveCount = plans.filter(plan => plan.linkedSessionId || plan.status === 'used_in_session').length;

  const summaryCards = [
    [BookOpenCheck, 'Added Plans', plans.length, 'Recent Plans'],
    [CalendarDays, 'Latest Plan', latestPlan ? localizedField(latestPlan.title, language) : 'No data yet', latestPlan ? formatPlanDate(latestPlan.date, language) : 'Pending Review'],
    [LayoutTemplate, 'Ready Templates', studyPlanTemplates.length, 'Choose Template'],
    [Link2, 'Linked to Live Session', linkedLiveCount, 'Use in Live Session'],
  ];

  const validateFile = file => {
    if (!file) return 'Please choose a file.';
    const extension = fileExtension(file);
    if (!SUPPORTED_EXTENSIONS.includes(extension)) return 'Unsupported file type';
    if (file.size > MAX_FILE_SIZE) return 'File size exceeds the allowed limit';
    return '';
  };

  const selectFile = file => {
    const error = validateFile(file);
    setFileError(error);
    setSelectedFile(error ? null : file);
  };

  const saveUploadedPlan = () => {
    const error = validateFile(selectedFile);
    if (error) {
      setFileError(error);
      return;
    }
    const title = selectedFile.name.replace(/\.[^.]+$/, '');
    const plan = addPlan({
      title: toLocalized(title),
      sourceType: 'file',
      className: DEFAULT_CLASS_NAME,
      date: new Date().toISOString().slice(0, 10),
      duration: 40,
      goals: { ar: 'ملف خطة درس مرفوع.', en: 'Uploaded lesson plan file.' },
      steps: { ar: 'راجع الملف المرفوع قبل الحصة أو أثناءها.', en: 'Review the uploaded file before or during the classroom session.' },
      materials: toLocalized(selectedFile.name),
      supportNotes: { ar: 'استخدم سياق الملف لتوجيه الدعم المباشر.', en: 'Use the uploaded plan context to guide live support.' },
      supportStudentIds: [],
      file: { name: selectedFile.name, type: selectedFile.type || fileExtension(selectedFile).toUpperCase(), size: selectedFile.size },
      summary: toLocalized(`${selectedFile.name} · ${formatSize(selectedFile.size)}`),
      status: 'pending_review',
    });
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSuccess('Study plan saved successfully.');
    setPreviewPlan(plan);
  };

  const saveManualPlan = event => {
    event.preventDefault();
    setFormError('');
    if (!manualForm.title.trim()) {
      setFormError('Plan title is required.');
      return;
    }
    const existingPlan = plans.find(plan => plan.id === editingId);
    const payload = {
      title: toLocalized(manualForm.title.trim()),
      sourceType: existingPlan?.sourceType || 'manual',
      className: classNamePayload(manualForm.className, language),
      date: manualForm.date,
      duration: Number(manualForm.duration) || 40,
      goals: toLocalized(manualForm.goals.trim()),
      steps: toLocalized(manualForm.steps.trim()),
      materials: toLocalized(manualForm.materials.trim()),
      supportNotes: toLocalized(manualForm.supportNotes.trim()),
      supportStudentIds: manualForm.supportStudentIds,
      summary: toLocalized(manualForm.goals.trim() || manualForm.steps.trim() || manualForm.supportNotes.trim()),
      status: 'saved',
    };
    if (editingId) {
      updatePlan(editingId, payload);
      setPreviewPlan({ ...existingPlan, ...payload });
      setEditingId(null);
      setSuccess('Study plan updated successfully.');
    } else {
      const plan = addPlan(payload);
      setPreviewPlan(plan);
      setSuccess('Study plan saved successfully.');
    }
    setManualForm(createEmptyForm(language));
  };

  const useTemplate = template => {
    const nextForm = {
      title: localizedField(template.title, language),
      className: localizedField(template.className || DEFAULT_CLASS_NAME, language),
      date: new Date().toISOString().slice(0, 10),
      duration: String(template.duration),
      goals: localizedField(template.goals, language),
      steps: localizedField(template.steps, language),
      materials: localizedField(template.materials, language),
      supportNotes: localizedField(template.supportNotes, language),
      supportStudentIds: [],
    };
    setManualForm(nextForm);
    setEditingId(null);
    setActiveTab('manual');
    setPreviewPlan({
      id: template.id,
      title: template.title,
      sourceType: 'template',
      className: template.className || DEFAULT_CLASS_NAME,
      date: nextForm.date,
      duration: template.duration,
      goals: template.goals,
      steps: template.steps,
      materials: template.materials,
      supportNotes: template.supportNotes,
      supportStudentIds: [],
      status: 'saved',
    });
    setSuccess('Template applied. You can edit it before saving.');
  };

  const editPlan = plan => {
    setManualForm({
      title: localizedField(plan.title, language),
      className: localizedField(plan.className || DEFAULT_CLASS_NAME, language),
      date: plan.date || new Date().toISOString().slice(0, 10),
      duration: String(plan.duration || 40),
      goals: localizedField(plan.goals, language),
      steps: localizedField(plan.steps, language),
      materials: localizedField(plan.materials, language),
      supportNotes: localizedField(plan.supportNotes, language),
      supportStudentIds: plan.supportStudentIds || [],
    });
    setEditingId(plan.id);
    setActiveTab('manual');
    setPreviewPlan(plan);
  };

  const linkToLiveSession = planId => {
    useInLiveSession(planId);
    setSuccess('The plan has been linked to the live session');
  };

  const recentPlans = useMemo(() => plans.slice(0, 6), [plans]);

  return (
    <div className="grid teacher-module-page study-plan-page">
      <PageHeader
        title="Study Plan"
        subtitle="Add the lesson or activity plan so SWAYA can support students based on classroom context."
        meta={{ label: 'Last updated', value: 'just now' }}
        badge="Linked to session context"
      />

      <div className="grid grid-4">
        {summaryCards.map(([Icon, label, value, trend]) => (
          <MetricCard key={label} icon={<Icon />} label={label} value={value} trend={trend} />
        ))}
      </div>

      {success && <div className="study-plan-feedback"><CheckCircle2 size={16} />{t(success)}</div>}

      <Card className="study-plan-input-card">
        <div className="teacher-section-head">
          <div>
            <h2>{t('Add Study Plan')}</h2>
            <p className="small muted">{t('Choose how you want to provide the lesson context.')}</p>
          </div>
          <FilterTabs items={[['upload', 'Upload File'], ['manual', 'Write Manually'], ['template', 'Choose Template']]} active={activeTab} onChange={setActiveTab} />
        </div>

        {activeTab === 'upload' && (
          <div className="study-plan-upload-panel">
            <button
              type="button"
              className={`study-plan-upload-zone ${fileError ? 'has-error' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={event => event.preventDefault()}
              onDrop={event => {
                event.preventDefault();
                selectFile(event.dataTransfer.files?.[0]);
              }}
            >
              <UploadCloud size={34} />
              <b>{t('Drag the plan file here or click to choose')}</b>
              <span>{t('Supports PDF, Word, and images')}</span>
              <small>{t('Maximum size 10MB')}</small>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
              onChange={event => selectFile(event.target.files?.[0])}
            />
            {fileError && <div className="study-plan-validation">{t(fileError)}</div>}
            {selectedFile && (
              <div className="study-plan-file-chip">
                <FileText size={18} />
                <div>
                  <b>{selectedFile.name}</b>
                  <span>{(selectedFile.type || fileExtension(selectedFile)).toUpperCase()} · {formatSize(selectedFile.size)}</span>
                </div>
                <button type="button" className="study-plan-remove-file" onClick={() => { setSelectedFile(null); setFileError(''); if (fileInputRef.current) fileInputRef.current.value = ''; }} aria-label={t('Remove file')}>
                  <X size={15} />
                </button>
              </div>
            )}
            <div className="teacher-action-row">
              <Button onClick={saveUploadedPlan}>{t('Save Plan')}</Button>
            </div>
          </div>
        )}

        {activeTab === 'manual' && (
          <form className="study-plan-form" onSubmit={saveManualPlan}>
            <label>
              <span>{t('Plan Title')}</span>
              <input className="input" value={manualForm.title} onChange={event => setManualForm({ ...manualForm, title: event.target.value })} />
            </label>
            <label>
              <span>{t('Grade / Group')}</span>
              <input className="input" value={manualForm.className} onChange={event => setManualForm({ ...manualForm, className: event.target.value })} />
            </label>
            <label>
              <span>{t('Session Date')}</span>
              <input className="input" type="date" value={manualForm.date} onChange={event => setManualForm({ ...manualForm, date: event.target.value })} />
              <small className="study-plan-date-label">{formatPlanDate(manualForm.date, language)}</small>
            </label>
            <label>
              <span>{t('Session Duration')}</span>
              <input className="input" type="number" min="5" value={manualForm.duration} onChange={event => setManualForm({ ...manualForm, duration: event.target.value })} />
            </label>
            <label className="study-plan-span">
              <span>{t('Lesson Goals')}</span>
              <textarea value={manualForm.goals} onChange={event => setManualForm({ ...manualForm, goals: event.target.value })} />
            </label>
            <label className="study-plan-span">
              <span>{t('Activity Steps')}</span>
              <textarea value={manualForm.steps} onChange={event => setManualForm({ ...manualForm, steps: event.target.value })} />
            </label>
            <label>
              <span>{t('Required Materials')}</span>
              <textarea value={manualForm.materials} onChange={event => setManualForm({ ...manualForm, materials: event.target.value })} />
            </label>
            <label>
              <span>{t('Follow-up Notes')}</span>
              <textarea value={manualForm.supportNotes} onChange={event => setManualForm({ ...manualForm, supportNotes: event.target.value })} />
            </label>
            <label className="study-plan-span">
              <span>{t('Students needing special support')}</span>
              <StudentPicker
                students={students}
                selectedIds={manualForm.supportStudentIds}
                onChange={supportStudentIds => setManualForm({ ...manualForm, supportStudentIds })}
              />
            </label>
            {formError && <div className="study-plan-validation study-plan-span">{t(formError)}</div>}
            <div className="teacher-action-row study-plan-span">
              <Button type="submit"><PencilLine size={16} />{t(editingId ? 'Update Plan' : 'Save Plan')}</Button>
              {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setManualForm(createEmptyForm(language)); }}>{t('Cancel')}</Button>}
            </div>
          </form>
        )}

        {activeTab === 'template' && (
          <div className="study-plan-template-grid">
            {studyPlanTemplates.map(template => (
              <div className="study-plan-template-card" key={template.id}>
                <div className="study-plan-template-icon"><LayoutTemplate size={18} /></div>
                <h3>{localizedField(template.title, language)}</h3>
                <p>{localizedField(template.description, language)}</p>
                <div className="study-plan-template-meta">
                  <span><Clock3 size={13} />{template.duration} {t('min')}</span>
                  <span>{localizedField(template.supportType, language)}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => useTemplate(template)}>{t('Use Template')}</Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-2">
        <Card>
          <div className="teacher-section-head compact">
            <div>
              <h2>{t('Recent Plans')}</h2>
              <p className="small muted">{t('Saved lesson context for upcoming and live sessions.')}</p>
            </div>
          </div>
          <div className="study-plan-recent-list">
            {recentPlans.length ? recentPlans.map(plan => {
              const supportNames = selectedStudentNames(plan.supportStudentIds, students, language);
              return (
                <div className="study-plan-recent-card" key={plan.id}>
                  <div className="study-plan-card-head">
                    <div>
                      <h3>{localizedField(plan.title, language)}</h3>
                      <p>{t(SOURCE_LABELS[plan.sourceType] || plan.sourceType)} · {formatPlanDate(plan.date, language)}</p>
                    </div>
                    <StatusBadge status={plan.status === 'pending_review' ? 'warning' : plan.status === 'used_in_session' ? 'active' : 'stable'}>{STATUS_LABELS[plan.status] || plan.status}</StatusBadge>
                  </div>
                  <p>{planSummary(plan, language)}</p>
                  <p className="study-plan-support-line">{supportNames.length ? `${t('Support students')}: ${supportNames.join('، ')}` : t('No support students selected')}</p>
                  {plan.linkedSessionId && <span className="study-plan-linked">{t('Linked session')}: {plan.linkedSessionId === 'live_demo' ? t('Live Session') : plan.linkedSessionId}</span>}
                  <div className="study-plan-actions">
                    <Button variant="ghost" size="sm" onClick={() => setPreviewPlan(plan)}>{t('View')}</Button>
                    <Button variant="outline" size="sm" onClick={() => editPlan(plan)}>{t('Edit')}</Button>
                    <Button variant="danger" size="sm" onClick={() => deletePlan(plan.id)}>{t('Delete')}</Button>
                    <Button variant="soft" size="sm" onClick={() => linkToLiveSession(plan.id)}>{t('Use in Live Session')}</Button>
                  </div>
                </div>
              );
            }) : <EmptyState title="No study plans yet" description="Upload, write, or choose a template to create the first study plan." />}
          </div>
        </Card>

        <Card>
          <div className="teacher-section-head compact">
            <div>
              <h2>{t('Plan Preview')}</h2>
              <p className="small muted">{t('Review the selected study plan before using it.')}</p>
            </div>
          </div>
          {previewPlan ? (
            <div className="study-plan-preview">
              <h3>{localizedField(previewPlan.title, language)}</h3>
              <div className="study-plan-preview-meta">
                <span>{t('Grade / Group')}: {localizedField(previewPlan.className || DEFAULT_CLASS_NAME, language)}</span>
                <span>{t('Session Duration')}: {previewPlan.duration} {t('min')}</span>
              </div>
              <b>{t('Lesson Goals')}</b>
              <p>{localizedField(previewPlan.goals, language)}</p>
              <b>{t('Activity Steps')}</b>
              <p>{localizedField(previewPlan.steps, language)}</p>
              <b>{t('Support Notes')}</b>
              <p>{localizedField(previewPlan.supportNotes, language)}</p>
              <b>{t('Students needing special support')}</b>
              <div className="study-plan-selected-chips">
                {selectedStudentNames(previewPlan.supportStudentIds, students, language).length
                  ? selectedStudentNames(previewPlan.supportStudentIds, students, language).map(name => <span className="study-plan-student-chip readonly" key={name}>{name}</span>)
                  : <span className="study-plan-empty-chip">{t('No students selected')}</span>}
              </div>
            </div>
          ) : (
            <EmptyState title="No plan selected" description="Choose View from a recent plan to preview it here." />
          )}
        </Card>
      </div>
    </div>
  );
}
