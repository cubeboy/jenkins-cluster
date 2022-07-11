import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as efs from 'aws-cdk-lib/aws-efs';
import { Construct } from 'constructs';
import { ClusterStackProps } from '../modules/ClusterStackProps';

export class CdkClusterFsApStack extends cdk.Stack {
  public readonly fsApHandle: string

  constructor(scope: Construct, id: string, props: ClusterStackProps) {
    super(scope, id, props);

    const stackNamespace = props.stackNamespace;
    const vpc = props.vpc;  
    try{
      
      const fsapSg = new ec2.SecurityGroup(this, stackNamespace + '-fsap-sg', {
        vpc,
        securityGroupName: stackNamespace + '-fsap-sg',
        allowAllOutbound: true,
        description: stackNamespace + ' :: Amazon EFS for EKS, SG for mount target'
      });
      fsapSg.addIngressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(2049), stackNamespace + '-cluster access');
      cdk.Tags.of(fsapSg).add('cfn.devops.stack', stackNamespace + '-fsap-stack');
      cdk.Tags.of(fsapSg).add('Name', stackNamespace + '-fsap-sg');
      cdk.Tags.of(fsapSg).add('env', 'dev');
      cdk.Tags.of(fsapSg).add('cost', 'com-code');

      const fs = new efs.FileSystem(this, stackNamespace + '-fs', {
        vpc: vpc,
        vpcSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_NAT}),
        fileSystemName: stackNamespace + '-fs',
        performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
        throughputMode: efs.ThroughputMode.BURSTING,
        securityGroup: fsapSg
      });
      fs.node.addDependency(fsapSg);
      cdk.Tags.of(fs).add('cfn.devops.stack', stackNamespace + '-fsap-stack');
      cdk.Tags.of(fs).add('efs.csi.aws.com/cluster', 'true');
      cdk.Tags.of(fs).add('Name', stackNamespace + '-fs');
      cdk.Tags.of(fs).add('env', 'dev');
      cdk.Tags.of(fs).add('cost', 'com-code');

      const ap = new efs.AccessPoint(this, stackNamespace + '-ap', {
        fileSystem: fs,
        posixUser: { uid: '1000', gid: '1000' },
        path: '/' + stackNamespace,
        createAcl: {
          ownerUid: '1000',
          ownerGid: '1000',
          permissions: '777',
        }
      });
      ap.node.addDependency(fs);
      cdk.Tags.of(ap).add('Name', stackNamespace + '-ap');
      cdk.Tags.of(ap).add('cost', 'com-code');

      this.fsApHandle = fs.fileSystemId + '::' + ap.accessPointId;

    }catch (error) {
      console.log('CdkDevopsClusterEfsStack Error :: ', error)
    }
  }
}
