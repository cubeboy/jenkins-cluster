import * as cdk from 'aws-cdk-lib';
import { PrivateSubnet, PublicSubnet } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { DevOpsStackProps } from '../modules/DevopsStackProps';

export class CdkDevopsSubnetStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DevOpsStackProps) {
    super(scope, id, props);

  /*
  const vpcId = cdk.Fn.importValue('devops-vpc-id');
  new cdk.CfnOutput(this, 'devops-vpc-id', {
    value: vpcId,
    exportName: 'devops-vpc-id'
  });
  */
  const vpcId = props.vpc.vpcId;
  const vpc = props.vpc;    
  vpc.publicSubnets.push(new PublicSubnet(this, "PublicSubnet01", {
    vpcId: props.vpc.vpcId.toString(),
    availabilityZone: 'ap-northeast-2a',
    cidrBlock: '192.168.0.0/24',
  }));
  vpc.publicSubnets.push(new PrivateSubnet(this, "PrivateSubnet01", {
    vpcId: props.vpc.vpcId,
    availabilityZone: 'ap-northeast-2a',
    cidrBlock: '192.168.1.0/24'
  }));
  vpc.privateSubnets.push(new PublicSubnet(this, "PublicSubnet02", {
    vpcId: vpcId,
    availabilityZone: 'ap-northeast-2c',
    cidrBlock: '192.168.2.0/24'
  }));
  vpc.privateSubnets.push(new PrivateSubnet(this, "PrivateSubnet02", {
    vpcId: vpcId,
    availabilityZone: 'ap-northeast-2c',
    cidrBlock: '192.168.3.0/24'
  }));
  
  /* additioanalCidr subnet 구성. 들어올땐 맘대로지만 나갈때는 아니므로 주의 할것.
  vpc.publicSubnets.push(new PublicSubnet(this, "PublicSubnet03", {
    vpcId: vpc.vpcId,
    availabilityZone: 'ap-northeast-2a',
    cidrBlock: '192.170.0.0/24'
  }));
  vpc.privateSubnets.push(new PrivateSubnet(this, "PrivateSubnet03", {
    vpcId: vpc.vpcId,
    availabilityZone: 'ap-northeast-2c',
    cidrBlock: '192.170.1.0/24'
  }));
  */
  }
  
}
