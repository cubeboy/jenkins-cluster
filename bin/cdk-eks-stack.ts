#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as account from '../resources/account'
import { CdkVpcStack } from '../lib/cdk-vpc-stack';
import { CdkEc2Stack } from '../lib/cdk-ec2-stack';
import { CdkClusterStack } from '../lib/cdk-cluster-stack';
import { CdkMonitorStack } from '../lib/cdk-monitor-stack';
import { CdkClusterFsApStack } from '../lib/cdk-cluster-fsap-stack';
import { CdkClusterDriverStack } from '../lib/cdk-cluster-driver-stack';
import { CdkCicdStack } from '../lib/cdk-cicd-stack';
import { StackInfo } from '../resources/devops-attribute';

const app = new cdk.App();

const propsEnv = { account: account.ACCOUNT_ID, region: account.REGION };

const vpcStack = new CdkVpcStack(app, StackInfo.name + 'VpcStack', {
  env: propsEnv
});

const ec2Stack = new CdkEc2Stack(app, StackInfo.name + 'Ec2Stack', {
  env: propsEnv,
  vpc: vpcStack.devopsVpc
});
ec2Stack.node.addDependency(vpcStack);

const fsapStack = new  CdkClusterFsApStack(app, StackInfo.name + 'ClusterFsApStack', {
  env: propsEnv,
  vpc: vpcStack.devopsVpc,
  stackNamespace: 'jenkins'
});
fsapStack.node.addDependency(vpcStack);

const clusterStack = new CdkClusterStack(app, StackInfo.name + 'ClusterStack', {
  env: propsEnv,
  vpc: vpcStack.devopsVpc
});
clusterStack.node.addDependency(vpcStack);

const monitorStack = new CdkMonitorStack(app, StackInfo.name + 'MonitorStack', {
  env: propsEnv,
  vpc: vpcStack.devopsVpc,
  cluster: clusterStack.eksCluster
});
monitorStack.node.addDependency(clusterStack);

const clusterDriverStack = new CdkClusterDriverStack(app, StackInfo.name + 'ClusterDriverStack', {
  env: propsEnv,
  vpc: vpcStack.devopsVpc,
  cluster: clusterStack.eksCluster
})
clusterDriverStack.node.addDependency(clusterStack);

const cicdStack = new CdkCicdStack(app, StackInfo.name + "CicdStack", {
  env: propsEnv,
  vpc: vpcStack.devopsVpc,
  cluster: clusterStack.eksCluster,
  stackNamespace: 'jenkins',
  fsApHandle: fsapStack.fsApHandle
});
cicdStack.addDependency(fsapStack);
