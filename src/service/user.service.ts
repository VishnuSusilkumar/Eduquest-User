import { IUserService } from "../interface/iUserInterface";
import { IUserRepository } from "../interface/iUserRepository";
import { User } from "../model/user.entities";
import jwt, { Secret } from "jsonwebtoken";
import "dotenv/config";
import bcrypt from "bcryptjs";
import { createActivationToken } from "./utils/activationToken";
import crypto from "crypto";
import sharp from "sharp";
import { S3Params } from "./types/interface";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./utils/s3";
import { createResetToken } from "./utils/ResetToken";

export class UserService implements IUserService {
  private repository: IUserRepository;

  constructor(repository: IUserRepository) {
    this.repository = repository;
  }

  async userRegister(userData: User) {
    try {
      const isEmailExist = await this.repository.findOne(userData.email);
      if (isEmailExist) {
        if (!userData.avatar) {
          return { success: false, message: "Email Already Exist!" };
        } else {
          const accessToken = isEmailExist.SignAccessToken();
          const refreshToken = isEmailExist.SignRefreshToken();
          return { accessToken, refreshToken, user: isEmailExist };
        }
      } else {
        if (!userData.avatar) {
          const activationToken = createActivationToken(userData);
          return activationToken;
        }
        const user = await this.repository.register(userData);
        const accessToken = user?.SignAccessToken();
        const refreshToken = user?.SignRefreshToken();
        return { success: true, accessToken, refreshToken, user };
      }
    } catch (err) {
      return null;
    }
  }

  async userLogin(email: string, password: string) {
    try {
      const user = await this.repository.findOne(email);
      if (!user) {
        return { success: false, message: "Invalid email" };
      }
      const isPassword = await user.comparePassword(password);
      if (!isPassword) {
        return { success: false, message: "Incorrect password" };
      }
      if (user.isBlocked) {
        return { success: false, message: "User is Blocked" };
      }
      const accessToken = user.SignAccessToken();
      const refreshToken = user.SignRefreshToken();
      return { accessToken, refreshToken, user };
    } catch (err) {
      return { success: false, message: "Failed to login" };
    }
  }

  async activateUser(data: { token: string; activationCode: string }) {
    try {
      const { token, activationCode } = data;
      const newUser = jwt.verify(token, process.env.JWT_SECRET as Secret) as {
        user: User;
        activationCode: string;
      };
      if (newUser.activationCode !== activationCode) {
        return { success: false, message: "Invalid Code!" };
      }
      const existingUser = await this.repository.findOne(newUser.user.email);
      if (existingUser) {
        return { success: false, message: "Email Already Exist" };
      }
      await this.repository.register(newUser.user);
      return { success: true, message: "Successfully registered", status: 201 };
    } catch (err) {
      return null;
    }
  }

  async getUser(id: string): Promise<User | any> {
    try {
      const user = await this.repository.findbyId(id);
      return user;
    } catch (err) {
      return null;
    }
  }

  async updateUserInfo(id: string, name: string) {
    try {
      const user = await this.repository.findbyIdAndUpdate(id, name);
      if (user) {
        const response = {
          status: 201,
          message: "User info and updated successfully",
        };
        return response;
      }
    } catch (err) {
      return null;
    }
  }

  async updatePassword(id: string, oldPassword: string, newPassword: string) {
    try {
      const user = await this.repository.findbyId(id);
      console.log(user);

      const isPasswordMatch = await user?.comparePassword(oldPassword);

      if (!isPasswordMatch) {
        return { success: false, message: "Password not match" };
      }

      const password = await bcrypt.hash(newPassword || "", 10);
      const result = await this.repository.updatePassword(id, password);
      if (result) {
        const response = {
          success: true,
          status: 201,
          message: "User password updated successfully",
        };
        return response;
      }
    } catch (err) {
      return null;
    }
  }

  deleteUser(userId: string): Promise<Object> {
    return this.repository.deleteUser(userId);
  }

  getInstructors() {
    return this.repository.getInstructors();
  }

  getUsers() {
    return this.repository.getUsers();
  }

  async updateAvatar(
    data: Buffer,
    fieldName: string,
    mimeType: string,
    id: string
  ) {
    const bufferData = Buffer.from(data);

    const randomImageName = (bytes = 32) =>
      crypto.randomBytes(bytes).toString("hex");
    const bucketName = process.env.S3_BUCKET_NAME || "";
    const buffer = await sharp(bufferData)
      .resize({ height: 600, width: 600, fit: "cover" })
      .toBuffer();

    const imageName = `Eduquest-profile/${randomImageName}`;
    const params: S3Params = {
      Bucket: bucketName,
      Key: imageName,
      Body: buffer,
      ContentType: mimeType,
    };

    const command = new PutObjectCommand(params);

    const rslt = await s3.send(command);
    const url = `https://eduquest-elearning.s3.ap-south-1.amazonaws.com/${imageName}`;
    await this.repository.avatarUpdate(id, url);
    return {
      status: 201,
      success: true,
      message: "Avatar Updated Successfully",
    };
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.repository.findOne(email);
      if (!user) {
        return { success: false, message: "User not found!" };
      }
      const resetTokenData = createResetToken(user);

      await this.repository.updateResetToken(
        user.id,
        resetTokenData.token,
        resetTokenData.resetCode
      );

      return {
        success: true,
        name: user.name,
        userId: user.id,
        email,
        message: "Reset code generated",
        resetCode: resetTokenData.resetCode,
        resetToken: resetTokenData.token,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async verifyResetCode(data: { token: string; resetCode: string }) {
    try {
      const { token, resetCode } = data;
      console.log("Token:", token); // Add this line
      console.log("Type of Token:", typeof token); // Add this line
      const decode = jwt.verify(token, process.env.JWT_SECRET as Secret) as {
        user: User;
        resetCode: string;
      };

      if (decode.resetCode !== resetCode) {
        return { success: false, message: "Invalid reset code" };
      }

      const user = await this.repository.findOne(decode.user.email);
      if (!user) {
        throw new Error("User not found");
      }

      if (user.resetToken !== token || new Date() > user.resetTokenExpires) {
        throw new Error("Invalid or expired reset token");
      }

      return {
        success: true,
        userId: user._id,
        message: "Reset code verified successfully",
      };
    } catch (e: any) {
      console.log(e);
      return { success: false, message: "Failed to verify reset code" };
    }
  }
  async resetPassword(userId: string, newPassword: string) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const user = await this.repository.updatePassword(userId, hashedPassword);

      if (!user) {
        return { success: false, message: "User not found" };
      }

      await this.repository.clearResetToken(userId);
      return { success: true, message: "Password reset successfully" };
    } catch (e) {
      console.log(e);
      return { success: false, message: "Failed to reset password" };
    }
  }

  async updateUserRole(userId: string, newRole: string) {
    try {
      const user = await this.repository.updateUserRole(userId, newRole);
      if (!user) {
        return { success: false, message: "User not found" };
      }
      return { success: true, message: "User role updated successfully", user };
    } catch (err) {
      console.error("Error updating user role:", err);
      return { success: false, message: "Failed to update user role" };
    }
  }

  async updateCourseList(userId: string, courseId: string) {
    await this.repository.updateCourseList(userId, courseId);
    return;
  }

  async verifyUser(userId: string) {
    try {
      const response = await this.repository.verifyUser(userId);
      if (!response) {
        return { success: false, message: "User not found" };
      }
      return {
        success: true,
        message: "Instructor Verified Successfully",
        status: 201,
      };
    } catch (e: any) {
      console.log(e);
    }
  }

  async blockUser(userId: string) {
    try {
      const response = await this.repository.blockUser(userId);
      if (!response) {
        return { success: false, message: "User not found" };
      }
      return {
        success: true,
        message: "User Blocked Successfully",
        status: 200,
        userId,
      };
    } catch (e: any) {
      console.log(e);
    }
  }

  async unBlockUser(userId: string) {
    try {
      const response = await this.repository.unBlockUser(userId);
      if (!response) {
        return { success: false, message: "User not found" };
      }
      return {
        success: true,
        message: "User unBlocked Successfully",
        status: 200,
      };
    } catch (e: any) {
      console.log(e);
    }
  }
}
