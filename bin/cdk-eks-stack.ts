#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as core from 'aws-cdk-lib/core';
import * as account from '../resources/account'
import { CdkVpcStack } from '../lib/cdk-vpc-stack';
import { CdkClusterStack } from '../lib/cdk-cluster-stack';
import { CdkMonitorStack } from '../lib/cdk-monitor-stack';
import { CdkClusterFsApStack } from '../lib/cdk-cluster-fsap-stack';
import { CdkClusterDriverStack } from '../lib/cdk-cluster-driver-stack';
import { CdkPvcStack } from '../lib/cdk-pvc-stack';
import { CdkCicdStack } from '../lib/cdk-cicd-stack';


const app = new cdk.App();

const propsEnv = { account: account.ACCOUNT_ID, region: account.REGION };

const vpcStack = new CdkVpcStack(app, 'CdkDevopsVpcStack', {
  env: propsEnv
});

const clusterStack = new CdkClusterStack(app, 'CdkDevopsClusterStack', {
  env: propsEnv,
  vpc: vpcStack.devopsVpc
});
clusterStack.node.addDependency(vpcStack);

const monitorStack = new CdkMonitorStack(app, 'CdkDevopsMonitorStack', {
  env: propsEnv,
  vpc: vpcStack.devopsVpc,
  cluster: clusterStack.eksCluster
});
monitorStack.node.addDependency(clusterStack);

const clusterDriverStack = new CdkClusterDriverStack(app, 'CdkDevopsClusterDriverStack', {
  env: propsEnv,
  vpc: vpcStack.devopsVpc,
  cluster: clusterStack.eksCluster
})
clusterDriverStack.node.addDependency(clusterStack);

const fsapStack = new  CdkClusterFsApStack(app, 'CdkDevopsClusterFsApStack', {
  env: propsEnv,
  vpc: vpcStack.devopsVpc,
  stackNamespace: 'jenkins'
});
fsapStack.node.addDependency(vpcStack);

const pvcStack = new CdkPvcStack(app, 'CdkDevopsPvcStack', {
  env: propsEnv,
  vpc: vpcStack.devopsVpc,
  cluster: clusterStack.eksCluster,
  stackNamespace: 'jenkins',
  fsApHandle: fsapStack.fsApHandle
});
pvcStack.node.addDependency(fsapStack);

/*
const cicdStack = new CdkCicdStack(app, "CdkDevopsCicdStack", {
  env: propsEnv,
  vpc: vpcStack.devopsVpc,
  cluster: clusterStack.eksCluster,
  stackNamespace: 'jenkins'
});
cicdStack.addDependency(pvcStack);
*/
