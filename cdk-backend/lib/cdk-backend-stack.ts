import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cognito from '@aws-cdk/aws-cognito';
import * as iam from "@aws-cdk/aws-iam";
import CognitoAuthRole from "./CognitoAuthRole";
// import noteTableResolver from "../resolvers/noteResolvers";
// import userTableResolver from "../resolvers/userResolver";
import UserStack from "../sub-stack-setups/user/user-stack";
import NoteStack from "../sub-stack-setups/note/note-stack";
import * as eventConfig from "../config/eventConfig.json";

export class CdkBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

        // The code that defines your stack goes here
        // **********************  DEFINING LAMBDA FUNCTIONS ***************************
        const userpool_pre_signup_trigger = new lambda.Function(this, eventConfig.id+'todoapp_userpool_pre_signup_trigger', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'pre_signup.handler',
            code: lambda.Code.fromAsset('lambda-fns'),
            memorySize: 1024
        });
        // **********************  CREATING USER POOL *******************************************
        const userPool = new cognito.UserPool(this, eventConfig.id+'todo-app-user-pool', {
        selfSignUpEnabled: true,
        accountRecovery: cognito.AccountRecovery.PHONE_AND_EMAIL,
        userVerification: {
            emailStyle: cognito.VerificationEmailStyle.CODE,
            emailBody: "Your verification code is {####}",
            emailSubject: "Your verification code",
        },
        // autoVerify: {
        //     email: true
        // },
        standardAttributes: {
            email: {
                required: true,
                mutable: true
            }
        },
        customAttributes: {
            first_name: new cognito.StringAttribute({minLen:1, maxLen:255, mutable: true}),
            last_name: new cognito.StringAttribute({minLen:1, maxLen:255, mutable: true}),
            event_app_id: new cognito.StringAttribute({minLen:1, maxLen:255, mutable: true}),
            user_type: new cognito.StringAttribute({minLen:1, maxLen:50, mutable: true})
        },
        passwordPolicy: {
            minLength: 6,
            requireDigits: false,
            requireLowercase: false,
            requireSymbols: false,
            requireUppercase: false,
            tempPasswordValidity: cdk.Duration.days(30),
        },
        lambdaTriggers: {
            preSignUp: userpool_pre_signup_trigger,
        }
        });
        
        const userPoolClient = new cognito.UserPoolClient(this, eventConfig.id+"UserPoolClient", {
            userPool,
            generateSecret: false
        });

        // create new identity pool
        const identityPool = new cognito.CfnIdentityPool(this, eventConfig.id+"IdentityPool", {
            allowUnauthenticatedIdentities: false, // Don't allow unathenticated users
            cognitoIdentityProviders: [
              {
                clientId: userPoolClient.userPoolClientId,
                providerName: userPool.userPoolProviderName,
              },
            ],
        });

        const authenticatedRole = new CognitoAuthRole(this, eventConfig.id+"CognitoAuthRole", {
            identityPool,
        });
        
        new cdk.CfnOutput(this, "UserPoolId", {
        value: userPool.userPoolId
        });
        
        new cdk.CfnOutput(this, "UserPoolClientId", {
            value: userPoolClient.userPoolClientId
        });

        new cdk.CfnOutput(this, "IdentityPoolId", {
            value: identityPool.ref,
        });

        new cdk.CfnOutput(this, "AuthenticatedRoleName", {
            value: authenticatedRole.role.roleName
        });

        // **********************  CREATING APPSYNC API *******************************************

        const api = new appsync.GraphqlApi(this, 'Api', {
            name: eventConfig.id+'cdk-notes-appsync-api',
            schema: appsync.Schema.fromAsset('graphql/schema.graphql'),
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: appsync.AuthorizationType.API_KEY,
                    apiKeyConfig: {
                        expires: cdk.Expiration.after(cdk.Duration.days(365))
                    }
                },
                additionalAuthorizationModes: [
                    {
                        authorizationType: appsync.AuthorizationType.USER_POOL,
                        userPoolConfig: {
                            userPool
                        }
                    }
                ]
            },
            xrayEnabled: true,
          });
      
          // Prints out the AppSync GraphQL endpoint to the terminal
          new cdk.CfnOutput(this, "aws_appsync_graphqlEndpoint", {
            value: api.graphqlUrl
          });
      
          // Prints out the AppSync GraphQL API key to the terminal
          new cdk.CfnOutput(this, "aws_appsync_apiKey", {
            value: api.apiKey || ''
          });

          // Prints out the base authentication type for API
        new cdk.CfnOutput(this, "aws_appsync_authenticationType", {
            value: appsync.AuthorizationType.API_KEY
        })
      
          // Prints out the stack region to the terminal
          new cdk.CfnOutput(this, "aws_stack_region", {
            value: this.region
          });

        // **********************  DEFINING EACH SUB STACK FOR EACH MODULE ***************************
        //   new UserStack(this, id, {api});
        //   new NoteStack(this, id, {api});
        UserStack(this, {api});
        NoteStack(this, {api});
    }
}
