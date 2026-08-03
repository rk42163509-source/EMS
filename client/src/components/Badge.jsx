import { getStatusBadge } from "../utils/helpers";

const Badge = ({ status, label }) => (
  <span className={`badge ${getStatusBadge(status)}`}>{label || status}</span>
);

export default Badge;
