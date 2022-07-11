import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as efs from 'aws-cdk-lib/aws-efs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { ClusterStackProps } from '../modules/ClusterStackProps';
import { Volume } from 'aws-cdk-lib/aws-ec2';
import { FederatedPrincipal } from 'aws-cdk-lib/aws-iam';

export class CdkPvcStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props: ClusterStackProps) {
    super(scope, id, props);

    if(props.cluster){
      const cluster = props.cluster;
      try{
        const stackNamespace = props.stackNamespace;
        
        const ns = cluster.addManifest(stackNamespace + '-namespace', {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: { name: stackNamespace },
        });
        
        const pv = cluster.addManifest(stackNamespace + '-pv', {
          apiVersion: 'v1',
          kind: 'PersistentVolume',
          metadata: { 
            name: stackNamespace + '-pv',
            namespace: stackNamespace
          },
          spec: {
            capacity: { storage: '2Gi' },
            volumeMode: 'Filesystem',
            accessModes: [ 'ReadWriteMany' ],
            persistentVolumeReclaimPolicy: 'Retain',
            storageClassName: 'efs-sc',
            csi: {
              driver: 'efs.csi.aws.com',
              volumeHandle: props.fsApHandle
            }
          }
        });

        const pvc = cluster.addManifest(stackNamespace + '-pvc', {
          apiVersion: 'v1',
          kind: 'PersistentVolumeClaim',
          metadata: {
            name: stackNamespace + '-pvc',
            namespace: stackNamespace
          },
          spec: {
            accessModes: [ 'ReadWriteMany' ],
            storageClassName: 'efs-sc',
            resources: {
              requests: { storage: '2Gi' }
            }
          }
        });
        pvc.node.addDependency(pv);

      }catch (error) {
        console.log('CdkDevopsClusterEfsStack Error :: ', error)
      }
    }
  }
}
