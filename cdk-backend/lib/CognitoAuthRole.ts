import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as cognito from "@aws-cdk/aws-cognito";
import * as eventConfig from "../config/eventConfig.json";

export default class CognitoAuthRole extends cdk.Construct {
  // Public reference to the IAM role
  role: any;

  constructor(scope: cdk.Construct, id: string, props?:any) {
    super(scope, id);

    const { identityPool } = props;

    // IAM role used for authenticated users
    this.role = new iam.Role(this, eventConfig.id+"CognitoDefaultAuthenticatedRole", {
      assumedBy: new iam.FederatedPrincipal(
        "cognito-identity.amazonaws.com",
        {
          StringEquals: {
            "cognito-identity.amazonaws.com:aud": identityPool.ref,
          },
          "ForAnyValue:StringLike": {
            "cognito-identity.amazonaws.com:amr": "authenticated",
          },
        },
        "sts:AssumeRoleWithWebIdentity"
      ),
    });

    this.role.addToPolicy(
      new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                "mobileanalytics:PutEvents",
                "cognito-sync:*",
                "cognito-identity:*",
                "dynamodb:GetItem",
                "dynamodb:BatchGetItem",
                "dynamodb:Query",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:BatchWriteItem",
                "lambda:InvokeFunction", // allow to execute lambda function
            ],
            resources: ["*"],
      })
    );

    new cognito.CfnIdentityPoolRoleAttachment(
      this,
      "IdentityPoolRoleAttachment",
      {
        identityPoolId: identityPool.ref,
        roles: { authenticated: this.role.roleArn },
      }
    );
  }
}