#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as account from '../resources/account'
//import { CdkEksStackStack } from '../lib/cdk-eks-stack-stack';
import { CdkDevopsVpcStack } from '../lib/cdk-devops-vpc-stack';
import { CdkDevopsSubnetStack } from '../lib/cdk-devops-subnet-stack';
import { CdkDevopsClusterStack } from '../lib/cdk-devops-cluster-stack';

const app = new cdk.App();
/*
new CdkEksStackStack(app, 'CdkDevOpsStack', {
  env: { account: account.ACCOUNT_ID, region: account.REGION }
});
*/

const propsEnv = { account: account.ACCOUNT_ID, region: account.REGION };

const vpcStack = new CdkDevopsVpcStack(app, 'CdkDevopsVpcStack', {
  env: propsEnv
});

const subnetStack = new CdkDevopsSubnetStack(app, 'CdkDevopsSubnetStack', {
  env: propsEnv, vpc: vpcStack.devopsVpc
});
subnetStack.node.addDependency(vpcStack);

const clusterStack = new CdkDevopsClusterStack(app, 'CdkDevopsClusterStack', {
  env: propsEnv, vpc: vpcStack.devopsVpc
});
clusterStack.node.addDependency(subnetStack);
