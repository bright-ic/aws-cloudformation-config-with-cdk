const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

type Params = {
  TableName: string | undefined,
  Key: string | {},
  ExpressionAttributeValues: any,
  ExpressionAttributeNames: any,
  UpdateExpression: string,
  ReturnValues: string
}

async function updateUserById(user: any) {
  let params : Params = {
    TableName: process.env.USER_TABLE,
    Key: {
      id: user.id
    },
    ExpressionAttributeValues: {},
    ExpressionAttributeNames: {},
    UpdateExpression: "",
    ReturnValues: "UPDATED_NEW"
  };
  let prefix = "set ";
  let attributes = Object.keys(user);
  for (let i=0; i<attributes.length; i++) {
    let attribute = attributes[i];
    if (attribute !== "id") {
      params["UpdateExpression"] += prefix + "#" + attribute + " = :" + attribute;
      params["ExpressionAttributeValues"][":" + attribute] = user[attribute];
      params["ExpressionAttributeNames"]["#" + attribute] = attribute;
      prefix = ", ";
    }
  }
 const response = { success: false, errors: {}, data: {}};
  try {
    await docClient.update(params).promise();
    response.success = true;
    response.data = user;
    return response;
  } catch (err) {
    console.log('DynamoDB error: ', err);
    response.errors = err.message;
    return response;
  }
}

export default updateUserById;