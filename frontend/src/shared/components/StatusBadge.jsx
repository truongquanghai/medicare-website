import { STATUS_TONE } from '../constants/appointment';

export default function StatusBadge({ status }) {
  return <span className={`status status--${STATUS_TONE[status] ?? 'pending'}`}>{status}</span>;
}
