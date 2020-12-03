const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

async function getUserById(id: string) {
    const params = {
        TableName: process.env.USER_TABLE,
        Key: { id }
    }
    const response = { success: false, message: "", errors: {}, data: {}};
    try {
        const { Item } = await docClient.get(params).promise();
        response.success = true;
        response.data = Item;
        return response;
    } catch (err) {
        console.log('DynamoDB error: ', err);
        response.errors = err.message;
        return response;
    }
}

export default getUserById