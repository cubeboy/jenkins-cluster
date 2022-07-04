import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eks from 'aws-cdk-lib/aws-eks'
import { Construct } from 'constructs';
import { DevOpsStackProps } from '../modules/DevopsStackProps';

export class CdkDevopsClusterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DevOpsStackProps) {
    super(scope, id, props);

    const devOpsEksCluster = new eks.Cluster(this, 'devops-cluster', {
      clusterName: 'devops-cluster',
      version: eks.KubernetesVersion.V1_21,
      vpc: props.vpc,
      defaultCapacity: 0,
    });
    
  }
}
