#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();
const stage = app.node.tryGetContext('stage') || 'flowlee-dev';

const certificateArn = app.node.tryGetContext('certificateArn');
if (!certificateArn) {
  throw new Error(
    'Missing required context: certificateArn. ' +
    'Provision an ACM certificate in us-east-1, validate it via GoDaddy DNS, ' +
    'then pass -c certificateArn=arn:aws:acm:us-east-1:...'
  );
}

new FrontendStack(app, `FlowleeFrontend-${stage}`, {
  stage,
  domainName: app.node.tryGetContext('domainName') || `${stage.replace('flowlee-', '')}.flowlee.com`,
  certificateArn,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'eu-west-1',
  },
});
