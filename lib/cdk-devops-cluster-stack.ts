import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { Construct } from 'constructs';
import { DevOpsStackProps } from '../modules/DevopsStackProps';

export class CdkDevopsClusterStack extends cdk.Stack {
  public readonly eksCluster: eks.Cluster;

  constructor(scope: Construct, id: string, props: DevOpsStackProps) {
    super(scope, id, props);

    const vpc = props.vpc;

    this.eksCluster = new eks.Cluster(this, 'devops-cluster', {
      clusterName: 'devops-cluster',
      version: eks.KubernetesVersion.V1_21,
      vpc: vpc,
      defaultCapacity: 0,
      tags: {
        ['cost']: 'com-code',
        ['owner']: 'cluster-user'
      }
    });

    this.eksCluster.addNodegroupCapacity('devops-nodegroup', {
      instanceTypes: [
        ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.LARGE)
      ],
      minSize: 1,
      maxSize: 3,
      desiredSize: 1,
      capacityType: eks.CapacityType.ON_DEMAND,
      diskSize: 20,
      amiType: eks.NodegroupAmiType.AL2_X86_64,
      subnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_NAT}),
      tags: {
        ['cost']: 'com-code',
        ['owner']: 'nodegroup-user'
      },
    });
  }
}
