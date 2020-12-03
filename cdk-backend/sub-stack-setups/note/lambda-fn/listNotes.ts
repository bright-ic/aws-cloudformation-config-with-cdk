const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

async function getNotes(limit: number) {
    const params = {
        TableName: process.env.NOTES_TABLE,
        limit: limit
    }
    try {
        const data = await docClient.scan(params).promise()
        return data.Items
    } catch (err) {
        console.log('DynamoDB error: ', err);
        return null
    }
}

export default getNotes;