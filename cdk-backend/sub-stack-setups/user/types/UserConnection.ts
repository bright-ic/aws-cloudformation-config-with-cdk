import User from "./User";

type UserConnection = {
    items: [User],
    nextToken?: string
}

export default UserConnection;