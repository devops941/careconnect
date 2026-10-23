import { Employee, IEmployee } from "@/models/Employee";
import { connectToDatabase } from "../database/mongodb";
import { AccountStatus } from "@/lib/constants";

export interface CreateEmployeeDto {
  employeeId: string;
  name: string;
  email: string;
  normalizedEmail: string;
  passwordHash: string;
  role: "DOCTOR" | "RECEPTIONIST" | "NURSE" | "ADMIN";
  department: string;
  phone?: string;
  status?: AccountStatus;
  createdBy?: string;
}

export class EmployeeRepository {
  async findByNormalizedEmail(normalizedEmail: string, includePassword = false): Promise<IEmployee | null> {
    await connectToDatabase();
    const query = Employee.findOne({ normalizedEmail });
    if (includePassword) {
      query.select("+passwordHash");
    }
    return query.exec();
  }

  async findByEmployeeId(employeeId: string, includePassword = false): Promise<IEmployee | null> {
    await connectToDatabase();
    const query = Employee.findOne({ employeeId: employeeId.trim().toUpperCase() });
    if (includePassword) {
      query.select("+passwordHash");
    }
    return query.exec();
  }

  async findById(id: string, includePassword = false): Promise<IEmployee | null> {
    await connectToDatabase();
    const query = Employee.findById(id);
    if (includePassword) {
      query.select("+passwordHash");
    }
    return query.exec();
  }

  async create(data: CreateEmployeeDto): Promise<IEmployee> {
    await connectToDatabase();
    const employee = new Employee(data);
    return employee.save();
  }

  async listAll(): Promise<IEmployee[]> {
    await connectToDatabase();
    return Employee.find().sort({ createdAt: -1 }).exec();
  }

  async updateLastLogin(id: string): Promise<void> {
    await connectToDatabase();
    await Employee.findByIdAndUpdate(id, { lastLoginAt: new Date() }).exec();
  }

  async count(): Promise<number> {
    await connectToDatabase();
    return Employee.countDocuments();
  }
}

export const employeeRepository = new EmployeeRepository();
