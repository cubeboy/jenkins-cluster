import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as account from '../resources/account';
import * as yaml from 'js-yaml';
import * as fs from 'fs';

export class CdkEksStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'DevOpsEks-Vpc',{
      vpcName: 'DevOpsEks-Vpc',
      cidr: '192.168.0.0/16',
      maxAzs: 2,
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
      ]
    });

    const devOpsEksCluster = new eks.Cluster(this, 'DevOpsEks-Cluster', {
      clusterName: 'DevOpsEks-Cluster',
      version: eks.KubernetesVersion.V1_21,
      vpc: vpc,
      defaultCapacity: 0,
    });

    devOpsEksCluster.addNodegroupCapacity('DevOpsEks-Nodegroup', {
      instanceTypes: [
        ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.LARGE)
      ],
      minSize: 1,
      maxSize: 3,
      desiredSize: 1,
      capacityType: eks.CapacityType.ON_DEMAND,
      diskSize: 20,
      amiType: eks.NodegroupAmiType.AL2_X86_64,
      subnets: { subnets: vpc.privateSubnets }

    });

    devOpsEksCluster.addHelmChart('prometheus', {
      repository: 'https://prometheus-community.github.io/helm-charts',
      chart: 'kube-prometheus-stack',
      release: 'prometheus',
      namespace: 'monitoring',
      createNamespace: true,
      values: {
        'grafana': {
          'service': {
            'type': 'LoadBalancer'
          }
        }
      }
    });

    devOpsEksCluster.addManifest('iam-loki-s3', {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name: 'iam-loki-s3',
        namespace: 'monitoring',
      },
      type: 'Opaque',
      data:{
        AWS_ACCESS_KEY_ID: account.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: account.AWS_SECRET_ACCESS_KEY
      }
    });

    const lokiValues : any = yaml.load(fs.readFileSync('./resources/loki-values.yaml', 'utf8')) ;
    
    devOpsEksCluster.addHelmChart('loki', {
      repository: 'https://grafana.github.io/helm-charts',
      chart: 'loki-stack',
      release: 'loki',
      namespace: 'monitoring',
      createNamespace: true,
      values: lokiValues,
    });
  }

  get availabilityZones(): string[] {
    return ['ap-northeast-2a', 'ap-northeast-2c'];
  }
}
