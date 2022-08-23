import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { Construct } from 'constructs';
import { ClusterStackProps } from '../modules/ClusterStackProps';
import { StackInfo, EksAttributes } from '../resources/devops-attribute';

export class CdkClusterStack extends cdk.Stack {
  public readonly eksCluster: eks.Cluster;

  constructor(scope: Construct, id: string, props: ClusterStackProps) {
    super(scope, id, props);

    const vpc = props.vpc;

    this.eksCluster = new eks.Cluster(this, StackInfo.name + '-cluster', {
      clusterName: StackInfo.name + '-cluster',
      version: eks.KubernetesVersion.V1_21,
      vpc: vpc,
      defaultCapacity: 0,
      tags: {
        ['cost']: StackInfo.cost,
        ['owner']: StackInfo.name + '-user'
      }
    });

    this.eksCluster.addNodegroupCapacity(StackInfo.name + '-nodegroup', {
      instanceTypes: [
        EksAttributes.instanceType
      ],
      minSize: EksAttributes.nodeMinSize,
      maxSize: EksAttributes.nodeMaxSize,
      desiredSize: EksAttributes.nodeDesiredSize,
      capacityType: eks.CapacityType.ON_DEMAND,
      diskSize: EksAttributes.nodeDiskSize,
      amiType: EksAttributes.nodeAmiType,
      subnets: vpc.selectSubnets({ subnetType: EksAttributes.nodeSubnetType}),
      tags: {
        ['cost']: StackInfo.cost,
        ['owner']: StackInfo.cost + '-nodegroup-user'
      },
    });
  }
}
