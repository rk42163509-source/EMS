export const successResponse = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const errorResponse = (res, message = "Error", statusCode = 500, errors = null) => {
  return res.status(statusCode).json({ success: false, message, errors });
};

export const paginate = (page = 1, limit = 10) => {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  return { page: p, limit: l, skip: (p - 1) * l };
};

export const getDayType = (hours) => {
  if (hours >= 8) return "Full Day";
  if (hours >= 6) return "Three Quarter Day";
  if (hours >= 4) return "Half Day";
  return "Short Day";
};

export const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const endOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const getDaysBetween = (start, end) => {
  const s = startOfDay(new Date(start));
  const e = startOfDay(new Date(end));
  return Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
};
