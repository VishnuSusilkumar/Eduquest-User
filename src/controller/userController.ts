import { IUserService } from "../interface/iUserInterface";
import publisher from "../events/publisher/user.publisher";
import { User, UserRole } from "../model/user.entities";

export class UserController {
  private service: IUserService;

  constructor(service: IUserService) {
    this.service = service;
  }

  onRegister = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      const userData: User = {
        name: data.name,
        email: data.email,
        password: data.password,
        avatar: "",
        role: UserRole.User,
        isVerified: false,
        isBlocked: false,
      };
      const response = await this.service.userRegister(userData);
      console.log(response);

      if (!response.success) {
        return response;
      } else {
        const activationData = {
          code: response.activationCode,
          name: data.name,
          email: data.email,
        };
        publisher.ActivationCode(activationData);
        return {
          message: "Activation code send to the Email",
          data: response,
          status: 201,
          success: true,
        };
      }
    } catch (e: any) {
      console.log(e);
    }
  };

  activateUser = async (data: { token: string; activationCode: string }) => {
    try {
      const response = await this.service.activateUser(data);
      return response;
    } catch (e: any) {
      console.log(e);
    }
  };

  loginUser = async (email: string, password: string) => {
    try {
      const response = await this.service.userLogin(email, password);
      return response;
    } catch (e: any) {
      console.log(e);
    }
  };
  getUser = async (id: string) => {
    try {
      console.log("Entered into the controller", id);
      const response = await this.service.getUser(id);
      if (response) {
        return response;
      }
    } catch (e: any) {
      console.log(e);
    }
  };
  socialAuth = async (data: {
    name: string;
    email: string;
    avatar: string;
  }) => {
    try {
      const userData = {
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        role: UserRole.User,
        isVerified: false,
        isBlocked: false,
      };
      const response = await this.service.userRegister(userData);
      if (response) {
        return response;
      }
    } catch (e: any) {
      console.log(e);
    }
  };
  updateUserInfo = async (data: { userId: string; name: string }) => {
    try {
      const response = await this.service.updateUserInfo(
        data.userId,
        data.name
      );
      if (response) {
        return response;
      }
    } catch (e: any) {
      console.log(e);
    }
  };

  updatePassword = async (data: {
    userId: string;
    oldPassword: string;
    newPassword: string;
  }) => {
    try {
      const response = await this.service.updatePassword(
        data.userId,
        data.oldPassword,
        data.newPassword
      );
      if (response) {
        console.log("response returned");
        return response;
      }
    } catch (e: any) {
      console.log(e);
    }
  };

  getUsers = async () => {
    try {
      const response = await this.service.getUsers();
      return response;
    } catch (e: any) {
      console.log(e);
    }
  };

  getInstructors = async () => {
    try {
      const response = await this.service.getInstructors();
      return response;
    } catch (e: any) {
      console.log(e);
    }
  };

  deleteUser = async (userId: string) => {
    try {
      const response = await this.service.deleteUser(userId);
      return response;
    } catch (e: any) {
      console.log(e);
    }
  };

  updateAvatar = async (
    data: Buffer,
    fieldName: string,
    mimetype: string,
    id: string
  ) => {
    try {
      const response = await this.service.updateAvatar(
        data,
        fieldName,
        mimetype,
        id
      );
      return response;
    } catch (e: any) {
      console.log(e);
    }
  };

  forgotPassword = async (data: { email: string }) => {
    try {
      const response = await this.service.forgotPassword(data.email);
      if (!response.success) {
        return response;
      }
      const resetData = {
        name: response.name,
        email: data.email,
        userId: response._id,
        resetCode: response.resetCode,
        resetToken: response.resetToken,
      };

      publisher.ResetCode(resetData);

      return {
        message: "Reset code send to the Email",
        data: response,
        status: 201,
        success: true,
      };
    } catch (e: any) {
      console.log(e);
    }
  };

  verifyResetCode = async (data: { token: string; resetCode: string }) => {
    try {
      const response = await this.service.verifyResetCode(data);
      return response;
    } catch (e: any) {
      console.log(e);
    }
  };

  resetPassword = async (data: { userId: string; newPassword: string }) => {
    try {
      const response = await this.service.resetPassword(
        data.userId,
        data.newPassword
      );
      if (!response.success) {
        return {
          msg: response.message,
          status: 400,
        };
      }
      return {
        msg: "Password reset successfully.",
        status: 200,
      };
    } catch (e: any) {
      console.log(e);
    }
  };

  async updateUserRole(data: { userId: string; newRole: string }) {
    try {
      const validRoles = Object.values(UserRole) as string[];
      if (!validRoles.includes(data.newRole)) {
        return { message: "Invalid role provided", status: 400 };
      }
      const role = data.newRole as UserRole;
      const response = await this.service.updateUserRole(data.userId, role);
      console.log(response);
      if (!response.success) {
        return { message: response.message, status: 400 };
      }
      return response;
    } catch (e: any) {
      console.log(e);
      return {
        message: "Internal server error",
        status: 500,
      };
    }
  }

  async updateCoureList(data: { userId: string; courseId: string }) {
    try {
      const response = await this.service.updateCourseList(
        data.userId,
        data.courseId
      );
      return {
        message: "Updated course list",
        data: response,
        status: 200,
        success: true,
      };
    } catch (e: any) {
      console.log(e);
    }
  }

  async verifyUser(id: string) {
    try {
      const response = await this.service.verifyUser(id);
      return response;
    } catch (e: any) {
      console.log(e);
    }
  }

  async blockUser(id: string) {
    try {
      const response = await this.service.blockUser(id);
      return response;
    } catch (e: any) {
      console.log(e);
    }
  }

  async unBlockUser(id: string) {
    try {
      const response = await this.service.unBlockUser(id);
      return response;
    } catch (e: any) {
      console.log(e);
    }
  }

  async getUserAnalytics(instructorId: string) {
    try {
      const response = await this.service.getUserAnalytics(instructorId);
      return response;
    } catch (e: any) {
      console.log(e);
    }
  }

  getUsersByRole = async (role: string) => {
    try {
      const response = await this.service.getUsersByRole(role);
      if (!response) {
        return {
          message: "No users found for this role",
          status: 404,
          success: false,
        };
      }
      return {
        message: "Users retrieved successfully",
        data: response,
        status: 200,
        success: true,
      };
    } catch (e: any) {
      console.log(e);
      return {
        message: "Internal server error",
        status: 500,
        success: false,
      };
    }
  };
}
