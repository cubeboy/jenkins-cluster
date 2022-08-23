import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { StackInfo, VpcAttributes } from '../resources/devops-attribute';

export class CdkVpcStack extends cdk.Stack {
  public readonly devopsVpc: ec2.Vpc

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.devopsVpc = new ec2.Vpc(this, 'devops-vpc', VpcAttributes);
    cdk.Tags.of(this.devopsVpc).add('cost', 'com-code');
    this.devopsVpc.publicSubnets.forEach(subnet => cdk.Tags.of(subnet).add('cost', StackInfo.cost));
    this.devopsVpc.publicSubnets.forEach(subnet => cdk.Tags.of(subnet).add('scope', 'public'));

    this.devopsVpc.privateSubnets.forEach(subnet => cdk.Tags.of(subnet).add('cost', StackInfo.cost));
    this.devopsVpc.privateSubnets.forEach(subnet => cdk.Tags.of(subnet).add('scope', 'private'));

    /* additioanalCidr 구성. 들어올땐 맘대로지만 나갈때는 아니므로 주의 할것.
    PublicSubnet, PrivateSubnet 을 직접 구성 할때는 NatGatway 등의 구성요소를 수동으로 설정해야 정상 동작함
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
