const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

type Note = {
    id: string;
    email: string;
    name: string;
    completed: boolean;
  }

async function addNote(note: Note) {
    const params = {
        TableName: process.env.NOTES_TABLE,
        Item: note
    }
    try {
        await docClient.put(params).promise();
        return note;
    } catch (err) {
        console.log('DynamoDB error: ', err);
        return {data:null};
    }
}

export default addNote;