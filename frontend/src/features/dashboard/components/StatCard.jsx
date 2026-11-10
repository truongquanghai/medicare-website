export default function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}
