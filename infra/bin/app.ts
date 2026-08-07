#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();
const stage = app.node.tryGetContext('stage') || 'dev';
const domainName = app.node.tryGetContext('domainName') || `${stage}.flowlee.com`;

new FrontendStack(app, `FlowleeFrontend-${stage}`, {
  stage,
  domainName,
  crossRegionReferences: true,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'eu-central-1',
  },
});
