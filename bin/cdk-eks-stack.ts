#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as account from '../resources/account'
import { CdkEksStackStack } from '../lib/cdk-eks-stack-stack';

const app = new cdk.App();
new CdkEksStackStack(app, 'CdkDevOpsStack', {
  env: { account: account.ACCOUNT_ID, region: account.REGION }
});
