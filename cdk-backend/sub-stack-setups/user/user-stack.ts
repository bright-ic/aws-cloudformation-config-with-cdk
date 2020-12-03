import * as cdk from '@aws-cdk/core';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from "@aws-cdk/aws-iam";
import * as eventConfig from "../../config/eventConfig.json";


export default (scope: cdk.Construct, props?:any) => {
    const {api} = props;
    // ********************** DYNAMODB TABLES DEFINITION *******************************************
    const userTable = new ddb.Table(scope, eventConfig.id+"TodoAppUserTable", {
        billingMode: ddb.BillingMode.PAY_PER_REQUEST, // Use on-demand billing mode
        partitionKey: { name: "id", type: ddb.AttributeType.STRING },
    });

    userTable.addGlobalSecondaryIndex({
        indexName: 'user-by-email',
        partitionKey: {
        name: 'email',
        type: ddb.AttributeType.STRING
        }
    });

    const userTableServiceRole = new iam.Role(scope, eventConfig.id+'userTableServiceRole', {
        assumedBy: new iam.ServicePrincipal('dynamodb.amazonaws.com')
    });
  
    userTableServiceRole.addToPolicy(
        new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            resources: [`${userTable.tableArn}/index/user-by-email`],
            actions: [            
            'dymamodb:Query'
            ]
        })
    );



    // Output values
    new cdk.CfnOutput(scope, "aws_dyanamodb_user_table", {
        value: userTable.tableName
    });
    new cdk.CfnOutput(scope, "aws_dyanamodb_user_table_arn", {
        value: userTable.tableArn
    });

    // **********************  LAMBDA DEFINITION ********************************
    const userLambda = new lambda.Function(scope, eventConfig.id+'AppSyncTodoUserHandler', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'initUserLambdaHandler.handler',
        code: lambda.Code.fromAsset('sub-stack-setups/user/lambda-fn'),
        memorySize: 1024
    });
      
      // Set the new Lambda function as a data source for the AppSync API
      const userLambdaDs = api.addLambdaDataSource(eventConfig.id+'lambdaTodoUserDatasource', userLambda); // user ds

    //   ATTACHING GRAPHQL RESOLVER TO THE LAMBDA FUNCTIONS
    
    userLambdaDs.createResolver({
        typeName: "Query",
        fieldName: "fetchUsers"
    });
    userLambdaDs.createResolver({
        typeName: "Query",
        fieldName: "getUserById"
    });
    userLambdaDs.createResolver({
        typeName: "Query",
        fieldName: "getUserByEmail"
    });

    userLambdaDs.createResolver({
        typeName: "Mutation",
        fieldName: "addUser"
    });
    userLambdaDs.createResolver({
        typeName: "Mutation",
        fieldName: "updateUserById"
    });

    // enable the Lambda function to access the DynamoDB table (using IAM)
    userTable.grantFullAccess(userLambda)

    // Create an environment variable that we will use in the function code
    userLambda.addEnvironment('USER_TABLE', userTable.tableName);
}