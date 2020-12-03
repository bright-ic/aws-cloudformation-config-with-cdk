const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
import UserConnection from "../types/UserConnection";
// import UserType from "../types/User";
import IParams from "../types/IParams";

// type IParams = {limit?: number, nextToken?: string, query?: UserType}

async function fetchUsers(queryParams: IParams) {
    let limit = 1000;

    if (queryParams && (typeof queryParams.limit === "number" && queryParams.limit != null)) {
        limit = queryParams.limit;
    }

    let params: any = {
        TableName: process.env.USER_TABLE,
        limit: limit
    }

    // check for pagination and set head to next page
    if (queryParams && typeof queryParams.nextToken === "string" && queryParams.nextToken != null) {
        params.ExclusiveStartKey = queryParams.nextToken;
    }

    // check for query parameters and filter/search based on query parameters
    if (typeof queryParams.query === "string" && queryParams.query != null && queryParams.query !== "") {
        // check if there if more than one query/filter clause
        if(queryParams.query.indexOf('|') != -1 ) {
            const filter_options = queryParams.query.split("|");
            // trim white spaces
            for(let i=0; i < filter_options.length; i++) {
                filter_options[i] = filter_options[i].trim();
            }
        } else {

        }
        let ExpressionAttributeValues: any = {};
        let ExpressionAttributeNames:any = {};
        let FilterExpression:any = "";
        let prefix = "";
        const query: any = queryParams.query;
        for(const queryKey in query) {
            FilterExpression += prefix + "#"+queryKey+" = :"+queryKey;
            ExpressionAttributeValues[":"+queryKey] = query[queryKey];
            ExpressionAttributeNames["#"+queryKey] = queryKey;
            prefix = " AND ";
        }

        params = {...params, FilterExpression, ExpressionAttributeValues, ExpressionAttributeNames}
    }

    const response = { success: false, message: "", error: null, data: {}};

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
        response.message = err.message;
        response.error = err;
        return response;

    }
}

export default fetchUsers;