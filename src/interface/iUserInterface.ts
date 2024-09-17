import { User } from "../model/user.entities";

export interface IUserService {
  userRegister(userData: User): any;
  activateUser(data: { token: string; activationCode: string }): any;
  getUser(id: string): Promise<User | any>;
  userLogin(email: string, password: string): any;
  updateUserInfo(id: string, name: string): any;
  updatePassword(id: string, oldPassword: string, newPassword: string): any;
  updateAvatar(
    data: Buffer,
    fieldName: string,
    mimeType: string,
    id: string
  ): any;
  getUsers(): any;
  getInstructors(): any;
  deleteUser(userId: string): Promise<Object>;
  forgotPassword(email: string): any;
  verifyResetCode(data: { token: string; resetCode: string }): any;
  resetPassword(userId: string, newPassword: string): any;
  updateUserRole(userId: string, newRole: string): any;
  updateCourseList(userId: string, courseId: string): any;
  verifyUser(userId: string): any;
  blockUser(userId: string): any;
  unBlockUser(userId: string): any;
  getUserAnalytics(instructorId: string): Promise<[{month: string, count:number}] | null>;
  getUsersByRole(role: string): Promise<User[] | any>;
}
