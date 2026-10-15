import { User, IUser } from "@/models/User";
import { connectToDatabase } from "../database/mongodb";
import { UserRole, AccountStatus } from "@/lib/constants";

export interface CreateUserDto {
  name: string;
  email: string;
  normalizedEmail: string;
  passwordHash?: string;
  googleProviderId?: string;
  role?: UserRole;
  status?: AccountStatus;
  emailVerifiedAt?: Date;
}

export class UserRepository {
  async findByNormalizedEmail(normalizedEmail: string, includePassword = false): Promise<IUser | null> {
    await connectToDatabase();
    const query = User.findOne({ normalizedEmail });
    if (includePassword) {
      query.select("+passwordHash");
    }
    return query.exec();
  }

  async findById(id: string, includePassword = false): Promise<IUser | null> {
    await connectToDatabase();
    const query = User.findById(id);
    if (includePassword) {
      query.select("+passwordHash");
    }
    return query.exec();
  }

  async findByGoogleId(googleProviderId: string): Promise<IUser | null> {
    await connectToDatabase();
    return User.findOne({ googleProviderId }).exec();
  }

  async create(data: CreateUserDto): Promise<IUser> {
    await connectToDatabase();
    const user = new User(data);
    return user.save();
  }

  async updatePassword(id: string, passwordHash: string): Promise<IUser | null> {
    await connectToDatabase();
    return User.findByIdAndUpdate(id, { passwordHash }, { returnDocument: "after" }).exec();
  }

  async updateLastLogin(id: string): Promise<void> {
    await connectToDatabase();
    await User.findByIdAndUpdate(id, { lastLoginAt: new Date() }).exec();
  }

  async verifyEmail(id: string): Promise<IUser | null> {
    await connectToDatabase();
    return User.findByIdAndUpdate(
      id,
      {
        emailVerifiedAt: new Date(),
        status: "ACTIVE",
      },
      { returnDocument: "after" }
    ).exec();
  }

  async linkGoogleAccount(id: string, googleProviderId: string): Promise<IUser | null> {
    await connectToDatabase();
    return User.findByIdAndUpdate(
      id,
      {
        googleProviderId,
        $addToSet: { authProviders: "google" },
        emailVerifiedAt: new Date(),
        status: "ACTIVE",
      },
      { returnDocument: "after" }
    ).exec();
  }
}

export const userRepository = new UserRepository();
