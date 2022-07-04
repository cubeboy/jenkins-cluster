import { PrivateSubnet, PublicSubnet } from 'aws-cdk-lib/aws-ec2';

export const VpcAttributes = {
  vpcName: 'devops-vpc',
  cidr: '192.168.0.0/16',
  enableDnsSupport: true,
  enableDnsHostnames: true,
  subnetConfiguration: [],
  availabilityZones: ['ap-northeast-2a', 'ap-northeast-2b', 'ap-northeast-2c', 'ap-northeast-2d']
}