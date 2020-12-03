#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkBackendStack } from '../lib/cdk-backend-stack';
import * as eventConfig from "../config/eventConfig.json";

const app = new cdk.App();
new CdkBackendStack(app, eventConfig.id);
