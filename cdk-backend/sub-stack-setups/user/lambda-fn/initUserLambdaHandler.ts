import updateUserById from "./updateUser";
import addUser from "./addUser";
import fetchUsers from "./getUsers";
import getUserById from "./getUserById";
import User from "../types/User";
import getUserByEmail from "./getUserByEmail";

// type User = {
//     id: string;
// 	firstName: string;
// 	lastName: String;
//   email: string;
// 	gender: string;
//   userType: string;
// 	phoneNumber: string;
// 	avatarUrl: string;
//   accessCode: string;
// 	registrationStatus: string;
// 	createdAt: string;
// 	updatedAt: string;
// }

type AppSyncEvent = {
    info: {
      fieldName: string
   },
    arguments: {
      id: string,
      user: User,
      queryParams: {limit: number, nextToken: string, query: string},
      limit: number, 
      nextToken: string,
      email: string
   }
}

exports.handler = async (event:AppSyncEvent) => {
    switch (event.info.fieldName) {
        case "updateUserById":
            return await updateUserById(event.arguments.user);
        case "addUser":
            return await addUser(event.arguments.user);
        case "fetchUsers":
            return await fetchUsers(event.arguments.limit, event.arguments.nextToken);
        case "getUserById": 
          return await getUserById(event.arguments.id);
        case "getUserByEmail":
          return await getUserByEmail(event.arguments.email);
        default:
          return "Function not found";
    }
}