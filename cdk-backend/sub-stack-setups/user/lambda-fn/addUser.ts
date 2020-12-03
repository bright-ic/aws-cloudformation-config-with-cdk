const AWS = require('aws-sdk');
import {randomBytes} from "crypto";

const docClient = new AWS.DynamoDB.DocumentClient();
const generateUID = () => ((Math.random()).toString(36).slice(2)+ randomBytes(8).toString('hex') +new Date().getTime());

type User = {
    id: string;
	firstName: string;
	lastName: String;
    email: string;
	gender: string;
    userType: string;
	phoneNumber: string;
	avatarUrl: string;
    accessCode: string;
	registrationStatus: string;
	createdAt: string;
	updatedAt: string;
  }

async function addUser(user: User) {
    if((user.id && user.id === "") || typeof user.id === "undefined") {
        user.id = generateUID();
    }
    const params = {
        TableName: process.env.USER_TABLE,
        Item: user,
        ConditionExpression: 'attribute_not_exists(id)'
    }

    const response:any = { success: false};
    try {

        await docClient.put(params).promise();
        response.success = true;
        response.data = user;
        return response;

    } catch (err) {
        console.log('DynamoDB error: ', err);
        response.errors = err.message;
        return response;
    }
}

export default addUser;