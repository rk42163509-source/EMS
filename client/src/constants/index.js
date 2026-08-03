export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const IMAGE_BASE = API_URL.replace("/api", "");

export const ROLES = {
  ADMIN: "ADMIN",
  EMPLOYEE: "EMPLOYEE",
};

export const LEAVE_TYPES = ["ANNUAL", "CASUAL", "SICK"];

export const LEAVE_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
};

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const DEPARTMENTS = [
  "Engineering", "Human Resources", "Marketing", "Sales", "Finance",
  "Operations", "IT Support", "Customer Success", "Product Management", "Design",
];
