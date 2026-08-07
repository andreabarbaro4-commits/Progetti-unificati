#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();
const stage = app.node.tryGetContext('stage') || 'dev';
const domainName = app.node.tryGetContext('domainName') || `${stage}.flowlee.com`;
const certificateArn = app.node.tryGetContext('certificateArn');

if (!certificateArn) {
  throw new Error('Missing required context: certificateArn. Pass -c certificateArn=arn:...');
}

new FrontendStack(app, `FlowleeFrontend-${stage}`, {
  stage,
  domainName,
  certificateArn,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'eu-central-1',
  },
  synthesizer: new cdk.DefaultStackSynthesizer({
    qualifier: 'flowlee',
  }),
});
