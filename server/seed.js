import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Employee from "./models/Employee.js";
import Department from "./models/Department.js";

dotenv.config();

const DEPARTMENTS = [
  "Engineering", "Human Resources", "Marketing", "Sales", "Finance",
  "Operations", "IT Support", "Customer Success", "Product Management", "Design",
];

const seed = async () => {
  await connectDB();

  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany(),
    Employee.deleteMany(),
    Department.deleteMany(),
  ]);

  console.log("Creating departments...");
  for (const name of DEPARTMENTS) {
    await Department.create({ name, description: `${name} department` });
  }

  console.log("Creating admin user...");
  const adminPassword = await bcrypt.hash("admin123", 12);
  await User.create({
    email: "admin@ems.com",
    password: adminPassword,
    role: "ADMIN",
  });

  console.log("Creating sample employees...");
  const employees = [
    {
      firstName: "John", lastName: "Doe", email: "john@ems.com", password: "employee123",
      department: "Engineering", position: "Senior Software Developer",
      basicSalary: 40000, allowances: 10000, deductions: 2000,
    },
    {
      firstName: "Alex", lastName: "Matthew", email: "alex@ems.com", password: "employee123",
      department: "Engineering", position: "Software Developer",
      basicSalary: 20000, allowances: 5000, deductions: 1000,
    },
    {
      firstName: "David", lastName: "Michael", email: "david@ems.com", password: "employee123",
      department: "IT Support", position: "Business Support Associate",
      basicSalary: 15000, allowances: 3000, deductions: 500,
    },
  ];

  for (const emp of employees) {
    const hashed = await bcrypt.hash(emp.password, 12);
    const user = await User.create({ email: emp.email, password: hashed, role: "EMPLOYEE" });
    await Employee.create({
      userId: user._id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: "9000000001",
      department: emp.department,
      position: emp.position,
      basicSalary: emp.basicSalary,
      allowances: emp.allowances,
      deductions: emp.deductions,
      joinDate: new Date("2020-01-15"),
    });
  }

  console.log("\n✅ Seed completed!");
  console.log("Admin: admin@ems.com / admin123");
  console.log("Employee: john@ems.com / employee123");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
