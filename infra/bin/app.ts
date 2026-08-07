#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CertificateStack } from '../lib/certificate-stack';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();
const stage = app.node.tryGetContext('stage') || 'dev';
const domainName = app.node.tryGetContext('domainName') || `${stage}.flowlee.com`;

const account = process.env.CDK_DEFAULT_ACCOUNT;

const synthesizerProps = {
  qualifier: 'flowlee',
};

// Certificate must be in us-east-1 for CloudFront
const certStack = new CertificateStack(app, `FlowleeFrontend-${stage}-cert`, {
  domainName,
  crossRegionReferences: true,
  env: { account, region: 'us-east-1' },
  synthesizer: new cdk.DefaultStackSynthesizer(synthesizerProps),
});

// Main stack in eu-central-1
const frontendStack = new FrontendStack(app, `FlowleeFrontend-${stage}`, {
  stage,
  domainName,
  certificate: certStack.certificate,
  crossRegionReferences: true,
  env: { account, region: 'eu-central-1' },
  synthesizer: new cdk.DefaultStackSynthesizer(synthesizerProps),
});

frontendStack.addDependency(certStack);
