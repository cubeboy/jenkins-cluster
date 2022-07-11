import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { Construct } from 'constructs';
import { ClusterStackProps } from '../modules/ClusterStackProps';
import { drivers } from '../resources/devops-attribute';

export class CdkClusterDriverStack extends cdk.Stack {
  
  constructor(scope: Construct, id: string, props: ClusterStackProps) {
    super(scope, id, props);

    const cluster = props.cluster;
    
    if(cluster != null && drivers.awsEfsDriver) {
      cluster.addHelmChart('aws-efs-sci-driver', {
        repository: 'https://kubernetes-sigs.github.io/aws-efs-csi-driver/',
        chart: 'aws-efs-csi-driver',
        release: 'aws-efs-sci-driver',
        namespace: 'cluster-driver',
        createNamespace: true,
        values: {
          'controller.serviceAccount.create': false,
          'serviceAccount.controller.name': 'efs-csi-controller-sa'
        }
      });

      cluster.addManifest('efs-sc', {
        apiVersion: 'storage.k8s.io/v1',
        kind: 'StorageClass',
        metadata: { 
          name: 'efs-sc',
        },
        provisioner: 'efs.csi.aws.com',
        volumeBindingMode: 'Immediate',
        allowVolumeExpansion: true
      });
    }
  }
}
