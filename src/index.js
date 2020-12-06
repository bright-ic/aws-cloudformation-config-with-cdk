import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Amplify from 'aws-amplify';
import * as eventConfig from "./eventConfig.json"
import cdkStack from './cdk-exports.json';

const CDKConfig = {
  aws_appsync_graphqlEndpoint: cdkStack[eventConfig.id]["awsappsyncgraphqlEndpoint"],
  aws_appsync_authenticationType: cdkStack[eventConfig.id]["awsappsyncauthenticationType"],
  aws_appsync_apiKey: cdkStack[eventConfig.id]["awsappsyncapiKey"],
  aws_project_region: cdkStack[eventConfig.id]["awsstackregion"],
  aws_cognito_identity_pool_id: cdkStack[eventConfig.id]["IdentityPoolId"],
  aws_cognito_region: cdkStack[eventConfig.id]["awsstackregion"],
  aws_user_pools_id: cdkStack[eventConfig.id]["UserPoolId"],
  aws_user_pools_web_client_id: cdkStack[eventConfig.id]["UserPoolClientId"],
}

Amplify.configure(CDKConfig);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
