import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { ClusterStackProps } from '../modules/ClusterStackProps';
import { StackInfo } from '../resources/devops-attribute';

export class CdkEc2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ClusterStackProps) {
    super(scope, id, props);

    const vpc = props.vpc;
    const stackName = id;
    const ec2sg = new ec2.SecurityGroup(this, id + '-ec2-sg', {
      vpc,
      securityGroupName: stackName + '-ec2-sg',
      description: stackName + ' :: Amazon EC2 For Single Application'
    });
    ec2sg.addIngressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(80), stackName + '-ec2 access');
    ec2sg.addEgressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.allTcp());
    cdk.Tags.of(ec2sg).add('Name', stackName + '-ec2-sg');
    cdk.Tags.of(ec2sg).add('cost', StackInfo.cost);

    const server = new ec2.Instance(this, stackName + '-ec2Server', {
      vpc: vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.LARGE),
      machineImage: ec2.MachineImage.latestAmazonLinux(),
      vpcSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_NAT}),
      securityGroup: ec2sg
    });
    cdk.Tags.of(server).add('Name', stackName + '-ec2');
    cdk.Tags.of(server).add('cost', StackInfo.cost);
  }
}
