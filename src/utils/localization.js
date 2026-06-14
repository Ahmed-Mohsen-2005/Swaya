export function localizedValue(value, language = 'en') {
  if (!value) return '';
  if (typeof value === 'object') return value[language] || value.en || value.ar || '';
  return value;
}

export function displayName(entity, language = 'en') {
  return localizedValue(entity?.name, language) || entity?.fullName || entity?.studentName || '';
}

export function shortDisplayName(entity, language = 'en') {
  return localizedValue(entity?.shortNameLocalized, language) || entity?.shortName || displayName(entity, language).split(/\s+/)[0] || '';
}

export function initialsForName(name) {
  return String(name || 'SW')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function initialsForEntity(entity, language = 'en') {
  return initialsForName(displayName(entity, language));
}

const enumLabels = {
  reportType: {
    weekly_parent: { en: 'Parent Weekly Report', ar: 'تقرير أسبوعي لولي الأمر' },
    clinical: { en: 'Clinical', ar: 'سريري' },
    class_session: { en: 'Class Session', ar: 'جلسة الصف' },
    session: { en: 'Session', ar: 'جلسة' },
    weekly: { en: 'Weekly', ar: 'أسبوعي' },
    monthly: { en: 'Monthly', ar: 'شهري' },
    parent_safe: { en: 'Parent-Safe Report', ar: 'تقرير مناسب لولي الأمر' },
    teacher: { en: 'Teacher Report', ar: 'تقرير المعلم' },
    class_weekly: { en: 'Class Weekly Summary', ar: 'ملخص الصف الأسبوعي' },
    follow_up: { en: 'Follow-up Report', ar: 'تقرير متابعة' },
  },
  status: {
    active: { en: 'Active', ar: 'نشط' },
    stable: { en: 'Stable', ar: 'مستقر' },
    published: { en: 'Published', ar: 'منشور' },
    draft: { en: 'Draft', ar: 'مسودة' },
    pending: { en: 'Pending', ar: 'بانتظار الإجراء' },
    pending_review: { en: 'Pending Review', ar: 'بانتظار المراجعة' },
    needs_review: { en: 'Needs Review', ar: 'يحتاج إلى مراجعة' },
    needs_attention: { en: 'Needs Attention', ar: 'يحتاج إلى متابعة' },
    completed: { en: 'Completed', ar: 'مكتملة' },
    active_plan: { en: 'Active Plan', ar: 'خطة نشطة' },
    high_risk: { en: 'High Risk', ar: 'خطر مرتفع' },
    moderate_risk: { en: 'Moderate Risk', ar: 'خطر متوسط' },
    low_risk: { en: 'Low Risk', ar: 'خطر منخفض' },
  },
  category: {
    stress_reduction: { en: 'Stress Reduction', ar: 'خفض التوتر' },
    home_activity: { en: 'Home Activity', ar: 'نشاط منزلي' },
    communication: { en: 'Communication', ar: 'التواصل' },
    social_interaction: { en: 'Social Interaction', ar: 'التفاعل الاجتماعي' },
    stress_management: { en: 'Stress Management', ar: 'إدارة التوتر' },
    attention: { en: 'Attention', ar: 'الانتباه' },
    live_monitoring: { en: 'Live Monitoring', ar: 'المراقبة المباشرة' },
    class_summary: { en: 'Class Summary', ar: 'ملخص الصف' },
  },
  priority: {
    High: { en: 'High', ar: 'مرتفع' },
    Medium: { en: 'Medium', ar: 'متوسط' },
    Low: { en: 'Low', ar: 'منخفض' },
    high: { en: 'High', ar: 'مرتفع' },
    medium: { en: 'Medium', ar: 'متوسط' },
    low: { en: 'Low', ar: 'منخفض' },
  },
  audience: {
    parent: { en: 'Parent', ar: 'ولي الأمر' },
    teacher: { en: 'Teacher', ar: 'المعلم' },
    doctor: { en: 'Specialist', ar: 'الأخصائي' },
    system: { en: 'System', ar: 'النظام' },
  },
};

function labelFromMap(group, value, language = 'en') {
  const key = String(value || '');
  const label = enumLabels[group]?.[key];
  if (label) return label[language] || label.en;
  if (!key) return '';
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

export function formatReportType(type, language = 'en') {
  return labelFromMap('reportType', type, language);
}

export function formatStatus(status, language = 'en') {
  return labelFromMap('status', status, language);
}

export function formatCategory(category, language = 'en') {
  return labelFromMap('category', category, language);
}

export function formatPriority(priority, language = 'en') {
  return labelFromMap('priority', priority, language);
}

export function formatAudience(audience, language = 'en') {
  return labelFromMap('audience', audience, language);
}
