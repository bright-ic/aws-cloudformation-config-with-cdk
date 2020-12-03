const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
import UserConnection from "../types/UserConnection";
async function fetchUsers(limit?:number, nextToken?:string) {

    if (typeof limit !== "number" || limit == null || limit===0) {
        limit = 1000;
    }

    let params: any = {
        TableName: process.env.USER_TABLE,
        limit: limit
    }

    // check for pagination and set head to next page
    if (typeof nextToken === "string" && nextToken != null) {
        params.ExclusiveStartKey = nextToken;
    }

    const response = { success: false, message: "", errors: {}, data: {}};

    try {

        const data = await docClient.scan(params).promise();
        
        let UserItems: UserConnection = {items: data.Items}

         // return nextToken if there are still more records/items for pagination
        if (typeof data.LastEvaluatedKey !== "undefined" && data.LastEvaluatedKey != null) {
            UserItems.nextToken = data.LastEvaluatedKey;
        }

        response.success = true;
        response.data = UserItems;
        return response;

    } catch (err) {

        console.log('DynamoDB error: ', err);
        response.errors = err.message;
        return response;

    }
}

export default fetchUsers;