import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { VpcAttributes } from '../resources/devops-attribute';

export class CdkDevopsVpcStack extends cdk.Stack {
  public readonly devopsVpc: ec2.Vpc

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const vpc = new ec2.Vpc(this, 'devops-vpc', VpcAttributes);

    cdk.Aspects.of(vpc).add(new cdk.Tag('cost', 'com-code'));
    this.devopsVpc = vpc;

    new cdk.CfnOutput(this, 'devops-vpc-id', {
      value: vpc.vpcId,
      exportName: 'devops-vpc-id'
    });

    
    /* additioanalCidr 구성. 들어올땐 맘대로지만 나갈때는 아니므로 주의 할것.
    const cidr = new ec2.CfnVPCCidrBlock(this, "additioanalCidr", {
      vpcId: vpc.vpcId,
      cidrBlock: '192.170.0.0/16'
    });
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