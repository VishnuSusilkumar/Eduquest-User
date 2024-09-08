import { IUserRepository } from "../interface/iUserRepository";
import UserModel, { IUser } from "../model/schema/userSchema";
import { User } from "../model/user.entities";

export class UserRepository implements IUserRepository {
  register(userData: User): Promise<IUser | null> {
    try {
      return UserModel.create(userData);
    } catch (e: any) {
      throw new Error("db error");
    }
  }
  async findOne(email: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({ email });
      return user;
    } catch (e: any) {
      throw new Error("db error");
    }
  }
  async findbyId(id: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findById(id);
      return user;
    } catch (e: any) {
      throw new Error("db error");
    }
  }
  async findbyIdAndUpdate(id: string, name: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findByIdAndUpdate(id, { name: name });
      console.log("completed");

      return user;
    } catch (e: any) {
      throw new Error("db error");
    }
  }
  async updatePassword(id: string, password: string): Promise<IUser | null> {
    try {
      console.log("Entered into the interface");
      const user = await UserModel.findByIdAndUpdate(id, {
        password: password,
      });
      console.log("Completed");
      return user;
    } catch (e: any) {
      throw new Error("db error");
    }
  }

  async getUsers() {
    try {
      const users = UserModel.find({ role: "user" });
      return users;
    } catch (e: any) {
      throw new Error("db error");
    }
  }
  getInstructors() {
    try {
      const instructors = UserModel.find({ role: "instructor" });
      return instructors;
    } catch (e: any) {
      throw new Error("db error");
    }
  }
  async deleteUser(userId: string): Promise<Object> {
    try {
      await UserModel.findByIdAndDelete(userId);
      return { success: true };
    } catch (e: any) {
      throw new Error("db error");
    }
  }

  async avatarUpdate(id: string, avatar: string): Promise<IUser | null> {
    try {
      return await UserModel.findByIdAndUpdate(id, { avatar });
    } catch (e: any) {
      throw new Error("db error");
    }
  }

  async updateResetToken(
    userId: string,
    resetToken: string,
    resetCode: string
  ): Promise<IUser | null> {
    try {
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + 5);

      return await UserModel.findByIdAndUpdate(
        userId,
        {
          resetToken,
          resetCode,
          resetTokenExpires: expirationTime,
        },
        { new: true }
      );
    } catch (e: any) {
      throw new Error("db error");
    }
  }

  async clearResetToken(userId: string): Promise<IUser | null> {
    try {
      return await UserModel.findByIdAndUpdate(
        userId,
        { $unset: { resetToken: 1, resetCode: 1, resetTokenExpires: 1 } },
        { new: true }
      );
    } catch (e: any) {
      throw new Error("db error");
    }
  }

  async updateUserRole(userId: string, newRole: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { role: newRole },
        { new: true }
      );
      return user;
    } catch (e: any) {
      throw new Error("db error");
    }
  }

  async updateCourseList(
    userId: string,
    courseId: string
  ): Promise<IUser | null> {
    try {
      const user = await UserModel.findById(userId);
      user?.courses.push({ courseId });
      await user?.save();
      return null;
    } catch (e: any) {
      throw new Error("db error");
    }
  }

  async verifyUser(userId: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { isVerified: true },
        { new: true }
      );
      return user;
    } catch (e: any) {
      throw new Error("db error");
    }
  }

  async blockUser(userId: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { isBlocked: true },
        { new: true }
      );
      console.log(user);

      return user;
    } catch (e: any) {
      throw new Error("db error");
    }
  }

  async unBlockUser(userId: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { isBlocked: false },
        { new: true }
      );
      return user;
    } catch (e: any) {
      throw new Error("db error");
    }
  }
}
