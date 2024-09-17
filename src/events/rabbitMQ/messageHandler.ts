import { UserController } from "../../controller/userController";
import { UserRepository } from "../../repository/userRepository";
import { UserService } from "../../service/user.service";
import rabbitClient from "./client";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

export default class MessageHandler {
  static async handle(
    operation: string,
    data: any,
    correlationId: string,
    replyTo: string
  ) {
    let response = data;
    console.log("The operation in user service is", operation, data);
    switch (operation) {
      case "register":
        response = await userController.onRegister.bind(userController)(data);
        break;

      case "activateUser":
        response = await userController.activateUser.bind(userController)(data);
        break;

      case "login":
        response = await userController.loginUser.bind(userController)(
          data.email,
          data.password
        );
        break;

      case "getUser":
        response = await userController.getUser.bind(userController)(data.id);
        break;

      case "socialAuth":
        response = await userController.socialAuth.bind(userController)(data);
        break;

      case "updateUserInfo":
        response = await userController.updateUserInfo.bind(userController)(
          data
        );
        break;

      case "updateUserPassword":
        response = await userController.updatePassword.bind(userController)(
          data
        );
        break;

      case "get-users":
        response = await userController.getUsers.bind(userController)();
        break;

      case "get-instructors":
        response = await userController.getInstructors.bind(userController)();
        break;

      case "delete-user":
        response = await userController.deleteUser.bind(userController)(data);
        break;

      case "updateUserAvatar":
        response = await userController.updateAvatar.bind(userController)(
          data.data,
          data.fieldName,
          data.mimetype,
          data.id
        );
        break;

      case "forgot-password":
        response = await userController.forgotPassword.bind(userController)(
          data
        );
        break;

      case "verify-reset-code":
        response = await userController.verifyResetCode.bind(userController)(
          data
        );
        break;

      case "reset-password":
        response = await userController.resetPassword.bind(userController)(
          data
        );
        break;

      case "update-user-role":
        response = await userController.updateUserRole.bind(userController)(
          data
        );
        break;

      case "update-course-list":
        response = await userController.updateCoureList.bind(userController)(
          data
        );
        break;

      case "verify-user":
        response = await userController.verifyUser.bind(userController)(
          data.id
        );
        break;

      case "block-user":
        response = await userController.blockUser.bind(userController)(data.id);
        break;

      case "un-block-user":
        response = await userController.unBlockUser.bind(userController)(
          data.id
        );
        break;

      case "getUserAnalytics":
        response = await userController.getUserAnalytics.bind(userController)(
          data
        );
        break;

      case "get-user-by-role":
        response = await userController.getUsersByRole.bind(userController)(
          data.role
        );
        break;

      default:
        response = "Request-key not found";
        break;
    }
    await rabbitClient.produce(response, correlationId, replyTo);
  }
}
