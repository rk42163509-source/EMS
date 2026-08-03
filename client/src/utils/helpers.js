export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);

export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

export const formatTime = (date) =>
  date ? new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—";

export const getStatusBadge = (status) => {
  const map = {
    PENDING: "badge-warning",
    APPROVED: "badge-success",
    REJECTED: "badge-danger",
    CANCELLED: "bg-slate-100 text-slate-600",
    ACTIVE: "badge-success",
    INACTIVE: "badge-danger",
    PRESENT: "badge-success",
    ABSENT: "badge-danger",
  };
  return map[status] || "bg-slate-100 text-slate-600";
};

export const getInitials = (firstName, lastName) =>
  `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();

export function getWorkingHoursDisplay(record) {
  if (record.workingHours != null) {
    const hrs = Math.floor(record.workingHours);
    const mins = Math.round((record.workingHours - hrs) * 60);
    return `${hrs}h ${mins}m`;
  }
  if (record.checkIn && !record.checkOut) {
    const diffMs = Date.now() - new Date(record.checkIn).getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const hrs = Math.floor(diffHours);
    const mins = Math.round((diffHours - hrs) * 60);
    return `${hrs}h ${mins}m (ongoing)`;
  }
  return "—";
}

export function getDayTypeDisplay(record) {
  if (record.dayType) {
    const map = {
      "Full Day": "badge-success",
      "Three Quarter Day": "bg-blue-100 text-blue-700",
      "Half Day": "badge-warning",
      "Short Day": "badge-danger",
    };
    return { label: record.dayType, className: map[record.dayType] || "bg-slate-100 text-slate-600" };
  }
  if (record.checkIn && !record.checkOut) {
    return { label: "In Progress", className: "bg-indigo-100 text-indigo-700" };
  }
  return { label: "—", className: "" };
}

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};
