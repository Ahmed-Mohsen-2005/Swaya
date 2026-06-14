import { useMemo, useState } from 'react';
import { Download, Eye, FileText, Send, Share2 } from 'lucide-react';
import { reports as baseReports, students } from '../../data/mockData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useI18n } from '../../i18n';
import { displayName, formatReportType, formatStatus } from '../../utils/localization';
import { MetricCard } from '../../components/ui/MetricCard';

function formatDate(value, language) {
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-AE' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
}

export default function DoctorReports() {
  const { t, language } = useI18n();
  const doctorPatients = students.filter(student => student.doctorIds.length);
  const [reports, setReports] = useState(baseReports);
  const [patientId, setPatientId] = useState(doctorPatients[0]?.id || '');
  const [type, setType] = useState('clinical');
  const [summary, setSummary] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const counts = useMemo(() => ({
    published: reports.filter(report => report.status === 'published').length,
    drafts: reports.filter(report => report.status === 'draft').length,
    pending: reports.filter(report => report.status === 'pending_review').length,
  }), [reports]);

  const createReport = () => {
    if (!patientId || !summary.trim()) {
      setError(t('Please select a patient and write report details.'));
      setNotice('');
      return;
    }
    const patient = doctorPatients.find(item => item.id === patientId);
    const newReport = {
      id: `rep_doctor_${Date.now()}`,
      studentId: patientId,
      title: type === 'clinical' ? 'Clinical Behavior Analysis' : 'Parent-Safe Reports',
      reportType: type,
      audience: type === 'parent_safe' ? 'parent' : 'doctor',
      date: new Date().toISOString(),
      status: 'draft',
      summary,
      relatedPatient: patient?.fullName,
    };
    setReports(current => [newReport, ...current]);
    setSummary('');
    setError('');
    setNotice(t('Report created as draft.'));
  };

  return (
    <div className="grid doctor-module-page">
      <div className="grid grid-4 doctor-summary-metrics">
        <MetricCard icon={<FileText/>} label="Current reports" value={reports.length} status="info"/>
        <MetricCard icon={<FileText/>} label="Published" value={counts.published} status="published" color="green"/>
        <MetricCard icon={<FileText/>} label="Draft reports" value={counts.drafts} status="draft" color="blue"/>
        <MetricCard icon={<FileText/>} label="Pending Review" value={counts.pending} status={counts.pending ? 'Need Review' : 'All clear'} color={counts.pending ? 'orange' : 'green'}/>
      </div>

      <div className="grid doctor-reports-layout">
        <Card>
          <div className="parent-page-head"><div><h2>{t('Create Report')}</h2><p className="small muted">{t('Prepare clinical or parent-safe reports from classroom evidence.')}</p></div></div>
          <div className="doctor-form-grid">
            <label>{t('Patient')}<select className="select" value={patientId} onChange={event => setPatientId(event.target.value)}>{doctorPatients.map(student => <option value={student.id} key={student.id}>{displayName(student, language)}</option>)}</select></label>
            <label>{t('Report type')}<select className="select" value={type} onChange={event => setType(event.target.value)}><option value="clinical">{formatReportType('clinical', language)}</option><option value="parent_safe">{formatReportType('parent_safe', language)}</option><option value="teacher">{formatReportType('teacher', language)}</option></select></label>
            <label className="doctor-form-span">{t('Report details')}<textarea rows={5} value={summary} onChange={event => setSummary(event.target.value)} placeholder={t('Clinical summary and recommendations...')} /></label>
          </div>
          <div className="parent-action-row"><Button onClick={createReport}><Send size={14}/>{t('Create Report')}</Button></div>
          {error && <div className="auth-alert error">{error}</div>}
          {notice && <div className="auth-alert info">{notice}</div>}
        </Card>

        <Card>
          <div className="parent-page-head"><div><h2>{t('Existing Reports')}</h2><p className="small muted">{t('Clinical reports, parent-safe reports, and draft summaries.')}</p></div></div>
          <div className="parent-card-list">
            {reports.map(report => {
              const patient = doctorPatients.find(item => item.id === report.studentId);
              return (
                <div className="doctor-report-card" key={report.id}>
                  <div className="parent-card-title-row"><h3>{t(report.title)}</h3><StatusBadge status={report.status === 'published' ? 'stable' : report.status === 'draft' ? 'gray' : 'warning'}>{formatStatus(report.status, language)}</StatusBadge></div>
                  <p className="muted">{t(report.summary)}</p>
                  <div className="parent-report-meta"><span>{displayName(patient, language) || t(report.relatedPatient)}</span><span>{formatReportType(report.reportType, language)}</span><span>{formatDate(report.date, language)}</span></div>
                  <div className="parent-action-row">
                    <Button size="sm" variant="outline"><Eye size={14}/>{t('View')}</Button>
                    <Button size="sm" variant="outline"><Download size={14}/>{t('Download')}</Button>
                    <Button size="sm" variant="outline"><Share2 size={14}/>{t('Share')}</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
