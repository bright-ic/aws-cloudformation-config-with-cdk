import * as cdk from '@aws-cdk/core';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from "@aws-cdk/aws-iam";
import * as eventConfig from "../../config/eventConfig.json";
export default (scope: cdk.Construct, props?:any) => {
    const {api} = props;


        // **********************  TABLE DEFINITION ********************************
        const noteTable = new ddb.Table(scope, eventConfig.id+"TodoNoteTable", {
            billingMode: ddb.BillingMode.PAY_PER_REQUEST, // Use on-demand billing mode
            partitionKey: { name: "id", type: ddb.AttributeType.STRING },
        });

        const noteTableServiceRole = new iam.Role(scope, eventConfig.id+'notesTableServiceRole', {
            assumedBy: new iam.ServicePrincipal('dynamodb.amazonaws.com')
        });
          
        noteTableServiceRole.addToPolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                resources: [`${noteTable.tableArn}/index/notes-email-index`],
                actions: [            
                'dymamodb:Query'
                ]
            })
        );
      

        // **********************  LAMBDA DEFINITION ********************************
        const notesLambda = new lambda.Function(scope, eventConfig.id+'TodoAppNotesHandler', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'notesHander.handler',
            code: lambda.Code.fromAsset('sub-stack-setups/note/lambda-fn'),
            memorySize: 1024
        });

        const notesLambdaDs = api.addLambdaDataSource(eventConfig.id+'lambdaTodoNoteDatasource', notesLambda); //notes ds

        notesLambdaDs.createResolver({
            typeName: "Query",
            fieldName: "getNote"
        });
        notesLambdaDs.createResolver({
            typeName: "Query",
            fieldName: "getNotes"
        });
        notesLambdaDs.createResolver({
            typeName: "Mutation",
            fieldName: "updateNoteById"
        });
        notesLambdaDs.createResolver({
            typeName: "Mutation",
            fieldName: "addNote"
        });

        // enable the Lambda function to access the DynamoDB table (using IAM)
        noteTable.grantFullAccess(notesLambda)

        // Create an environment variable that we will use in the function code
        notesLambda.addEnvironment('NOTES_TABLE', noteTable.tableName);
}