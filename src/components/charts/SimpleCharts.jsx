import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useI18n } from '../../i18n';

const tooltipStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #D7EAF4',
  borderRadius: 12,
  boxShadow: '0 18px 40px rgba(13,43,87,.12)',
  color: '#0D2B57',
  maxWidth: 240,
};

const metricKeys = {
  attention: 'Attention',
  engagement: 'Engagement',
  stress: 'Stress',
  social: 'Social',
  value: 'Value',
  count: 'Count',
};

function metricLabel(t, value) {
  const key = metricKeys[value] || value.charAt(0).toUpperCase() + value.slice(1);
  return t(key);
}

function useChartConfig() {
  const { t } = useI18n();
  const axis = {
    fontSize: 11,
    fill: '#64748B',
    fontWeight: 700,
    fontFamily: '"IBM Plex Sans Arabic", system-ui, sans-serif',
  };

  return { t, axis };
}

function normalizeData(data) {
  return Array.isArray(data) ? data.filter(Boolean) : [];
}

function EmptyChart() {
  const { t } = useI18n();
  return (
    <div className="chart-empty" dir="auto">
      {t('Not enough data to display the chart')}
    </div>
  );
}

function ChartLegend({ items }) {
  if (!items?.length) return null;
  return (
    <div className="chart-legend" dir="auto">
      {items.map((item) => (
        <span key={item.key} className="chart-legend-item">
          <i style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function ChartShell({ children, data, height = 280, compact = false, legend }) {
  const safeData = normalizeData(data);

  if (!safeData.length) {
    return (
      <div className={`chart-shell ${compact ? 'compact' : ''}`} style={{ '--chart-height': `${height}px` }}>
        <EmptyChart />
      </div>
    );
  }

  return (
    <div className={`chart-shell ${compact ? 'compact' : ''}`} style={{ '--chart-height': `${height}px` }}>
      <div className="chart-plot" dir="ltr">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          {children(safeData)}
        </ResponsiveContainer>
      </div>
      <ChartLegend items={legend} />
    </div>
  );
}

function chartMargin(type = 'line') {
  if (type === 'bar') return { top: 16, right: 18, left: 8, bottom: 18 };
  if (type === 'mini') return { top: 8, right: 8, left: 8, bottom: 6 };
  return { top: 16, right: 18, left: 8, bottom: 18 };
}

export function LiveLineChart({ data, height = 270 }) {
  const { t, axis } = useChartConfig();
  const legend = [
    { key: 'attention', label: t('Attention'), color: '#38AEEA' },
    { key: 'engagement', label: t('Engagement'), color: '#16A36A' },
    { key: 'stress', label: t('Stress'), color: '#F59E0B' },
  ];

  return (
    <ChartShell data={data} height={height} legend={legend}>
      {(safeData) => (
        <LineChart data={safeData} margin={chartMargin('line')}>
          <CartesianGrid stroke="#EAF1F6" strokeDasharray="3 4" vertical={false} />
          <XAxis
            dataKey="time"
            tick={axis}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={14}
            tickFormatter={(value) => t(value)}
          />
          <YAxis domain={[0, 100]} tick={axis} axisLine={false} tickLine={false} width={34} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(value) => t(value)}
            formatter={(value, name) => [value, metricLabel(t, String(name))]}
          />
          <Line name={t('Attention')} type="monotone" dataKey="attention" stroke="#38AEEA" strokeWidth={2.4} dot={false} activeDot={{ r: 4 }} />
          <Line name={t('Engagement')} type="monotone" dataKey="engagement" stroke="#16A36A" strokeWidth={2.4} dot={false} activeDot={{ r: 4 }} />
          <Line name={t('Stress')} type="monotone" dataKey="stress" stroke="#F59E0B" strokeWidth={2.4} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      )}
    </ChartShell>
  );
}

export function MiniLineChart({ data, height = 92 }) {
  const { t } = useChartConfig();

  return (
    <ChartShell data={data} height={height} compact>
      {(safeData) => (
        <LineChart data={safeData} margin={chartMargin('mini')}>
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(value) => t(value)}
            formatter={(value, name) => [value, metricLabel(t, String(name))]}
          />
          <Line type="monotone" dataKey="attention" stroke="#38AEEA" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="stress" stroke="#F59E0B" dot={false} strokeWidth={2} />
        </LineChart>
      )}
    </ChartShell>
  );
}

export function StudentsBarChart({ data, height = 285 }) {
  const { t, axis } = useChartConfig();
  const legend = [
    { key: 'attention', label: t('Attention'), color: '#38AEEA' },
    { key: 'engagement', label: t('Engagement'), color: '#16A36A' },
    { key: 'stress', label: t('Stress'), color: '#F59E0B' },
  ];

  return (
    <ChartShell data={data} height={height} legend={legend}>
      {(safeData) => (
        <BarChart data={safeData} margin={chartMargin('bar')}>
          <CartesianGrid stroke="#EAF1F6" strokeDasharray="3 4" vertical={false} />
          <XAxis
            dataKey="name"
            tick={axis}
            axisLine={false}
            tickLine={false}
            interval={0}
            minTickGap={8}
            tickFormatter={(value) => t(value)}
          />
          <YAxis domain={[0, 100]} tick={axis} axisLine={false} tickLine={false} width={34} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(value) => t(value)}
            formatter={(value, name) => [value, metricLabel(t, String(name))]}
          />
          <Bar name={t('Attention')} dataKey="attention" fill="#38AEEA" radius={[6, 6, 0, 0]} />
          <Bar name={t('Engagement')} dataKey="engagement" fill="#16A36A" radius={[6, 6, 0, 0]} />
          <Bar name={t('Stress')} dataKey="stress" fill="#F59E0B" radius={[6, 6, 0, 0]} />
        </BarChart>
      )}
    </ChartShell>
  );
}

export function WellbeingGauge({ value = 82, height = 170 }) {
  const { t } = useChartConfig();
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const data = [{ name: t('Wellbeing'), value: safeValue, fill: safeValue > 70 ? '#16A36A' : '#F59E0B' }];

  return (
    <ChartShell data={data} height={height}>
      {(safeData) => (
        <RadialBarChart innerRadius="72%" outerRadius="100%" data={safeData} startAngle={90} endAngle={-270}>
          <RadialBar dataKey="value" cornerRadius={20} />
          <Legend
            iconSize={0}
            formatter={() => <span style={{ fontWeight: 900, color: '#0D2B57', fontSize: 23 }}>{safeValue}%</span>}
          />
        </RadialBarChart>
      )}
    </ChartShell>
  );
}
