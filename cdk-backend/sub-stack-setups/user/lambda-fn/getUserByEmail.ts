const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

async function getUserByEmail(email: string) {

    const params = {
        TableName: process.env.USER_TABLE,
        IndexName: "user-by-email",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email }
    }

    const response = { success: false, message: "", errors: {}, data: {}};

    try {

        const { Items } = await docClient.query(params).promise();

        response.success = true;
        response.data = Items;
        return response;

    } catch (err) {

        console.log('DynamoDB error: ', err);
        response.errors = err.message;
        return response;

    }
}

export default getUserByEmail;