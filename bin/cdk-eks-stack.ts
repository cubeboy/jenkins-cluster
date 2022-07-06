#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as account from '../resources/account'
//import { CdkEksStackStack } from '../lib/cdk-eks-stack-stack';
import { CdkDevopsVpcStack } from '../lib/cdk-devops-vpc-stack';
import { CdkDevopsClusterStack } from '../lib/cdk-devops-cluster-stack';
import { CdkDevopsMonitorStack } from '../lib/cdk-devops-monitor-stack';


const app = new cdk.App();

const propsEnv = { account: account.ACCOUNT_ID, region: account.REGION };

const vpcStack = new CdkDevopsVpcStack(app, 'CdkDevopsVpcStack', {
  env: propsEnv
});

const clusterStack = new CdkDevopsClusterStack(app, 'CdkDevopsClusterStack', {
  env: propsEnv, vpc: vpcStack.devopsVpc
});
clusterStack.node.addDependency(vpcStack);

const monitorStack = new CdkDevopsMonitorStack(app, 'CdkDevopsMonitorStack', {
  env: propsEnv, vpc: vpcStack.devopsVpc, cluster: clusterStack.eksCluster
});
monitorStack.node.addDependency(clusterStack);
