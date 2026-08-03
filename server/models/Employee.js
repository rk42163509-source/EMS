import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    department: { type: String, default: "" },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    position: { type: String, default: "" },
    basicSalary: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    employmentStatus: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
    joinDate: { type: Date, default: Date.now },
    image: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
    bio: { type: String, default: "" },
    annualLeaveBalance: { type: Number, default: 20 },
    casualLeaveBalance: { type: Number, default: 10 },
    sickLeaveBalance: { type: Number, default: 10 },
  },
  { timestamps: true }
);

employeeSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

employeeSchema.set("toJSON", { virtuals: true });
employeeSchema.set("toObject", { virtuals: true });

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
