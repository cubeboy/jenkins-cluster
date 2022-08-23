import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eks from 'aws-cdk-lib/aws-eks'

export const StackInfo = {
  name: 'CdkDevOps',
  cost: 'com-code'
}

export const VpcAttributes = {
  vpcName: 'devops-vpc',
  cidr: '192.168.0.0/16',
  enableDnsSupport: true,
  enableDnsHostnames: true,
  subnetConfiguration: [
    {
      cidrMask: 25,
      name: 'PublicSubnet',
      subnetType: ec2.SubnetType.PUBLIC,
    }, {
      cidrMask: 25,
      name: 'PrivateSubnet',
      subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
    },
  ],
  availabilityZones: ['ap-northeast-2a', 'ap-northeast-2c']
} as ec2.VpcProps

export const drivers = {
  awsEfsDriver: true,
}

export const efsAttributes = {
  jenkins: {
    storage: '10Gi'
  },
  grafana: {
    storage: '2Gi'
  },
}

export const EksAttributes = {
  instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.LARGE),
  nodeMinSize: 1,
  nodeMaxSize: 2,
  nodeDesiredSize: 1,
  nodeDiskSize: 20,
  nodeAmiType: eks.NodegroupAmiType.AL2_X86_64,
  nodeSubnetType: ec2.SubnetType.PRIVATE_WITH_NAT
}
