import api from "./api";

export const authService = {
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  changePassword: (data) => api.put("/auth/change-password", data),
};

export const dashboardService = {
  getAdmin: () => api.get("/dashboard/admin"),
  getEmployee: () => api.get("/dashboard/employee"),
};

export const employeeService = {
  getAll: (params) => api.get("/employees", { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post("/employees", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  update: (id, data) => api.put(`/employees/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  delete: (id) => api.delete(`/employees/${id}`),
};

export const attendanceService = {
  checkIn: () => api.post("/attendance/check-in"),
  checkOut: () => api.post("/attendance/check-out"),
  getToday: () => api.get("/attendance/today"),
  getMy: (params) => api.get("/attendance/my", { params }),
  getAll: (params) => api.get("/attendance", { params }),
  export: (params) => api.get("/attendance/export", { params, responseType: "blob" }),
};

export const leaveService = {
  apply: (data) => api.post("/leaves", data),
  cancel: (id) => api.put(`/leaves/${id}/cancel`),
  getMy: (params) => api.get("/leaves/my", { params }),
  getAll: (params) => api.get("/leaves", { params }),
  updateStatus: (id, data) => api.put(`/leaves/${id}/status`, data),
  getStats: () => api.get("/leaves/stats"),
};

export const payslipService = {
  generate: (data) => api.post("/payslips/generate", data),
  getAll: (params) => api.get("/payslips", { params }),
  getMy: (params) => api.get("/payslips/my", { params }),
  getById: (id) => api.get(`/payslips/${id}`),
};

export const departmentService = {
  getAll: () => api.get("/departments"),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post("/departments", data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
  assignEmployee: (id, employeeId) => api.post(`/departments/${id}/assign`, { employeeId }),
};

export const profileService = {
  get: () => api.get("/profile"),
  update: (data) => api.put("/profile", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
};
