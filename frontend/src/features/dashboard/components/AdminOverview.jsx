import { useAsync } from '../../../shared/hooks/useAsync';
import { formatCurrency, formatMonth } from '../../../shared/utils/format';
import { adminApi } from '../services/adminApi';
import StatCard from './StatCard';

function MonthlyChart({ months }) {
  const peak = Math.max(...months.map((item) => item.total), 1);

  return (
    <div className="dashboard-panel">
      <h2>Lịch hẹn theo tháng</h2>
      <ul className="bar-chart">
        {months.map(({ month, total }) => (
          <li key={month}>
            <span className="bar-chart__value">{total}</span>
            <span className="bar-chart__bar" style={{ height: `${(total / peak) * 100}%` }} />
            <span className="bar-chart__label">{formatMonth(month)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminOverview() {
  const { data: stats, loading, error } = useAsync(adminApi.getStats);

  if (loading) return <p>Đang tải thống kê...</p>;
  if (error) return <p className="form-error">Không thể tải thống kê. Vui lòng thử lại sau.</p>;

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Bệnh nhân" value={stats.patients} />
        <StatCard label="Bác sĩ" value={stats.doctors} />
        <StatCard label="Tổng lịch hẹn" value={stats.appointments} />
        <StatCard label="Doanh thu (đã xác nhận)" value={formatCurrency(stats.revenue)} />
      </div>
      {stats.monthly.length > 0 && <MonthlyChart months={stats.monthly} />}
    </>
  );
}
