import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ClusterStackProps } from '../modules/ClusterStackProps';
import { efsAttributes } from '../resources/devops-attribute';

export class CdkCicdStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props: ClusterStackProps) {
    super(scope, id, props);

    const cluster = props.cluster;
    const stackNamespace = props.stackNamespace;
    const storageClassName = stackNamespace + '-sc'
    const jenkinsAttributes = efsAttributes.jenkins;
    if(cluster) {
      const jenkinsNamespace = cluster.addManifest(stackNamespace + '-namespace', {
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
          capacity: { storage: jenkinsAttributes.storage },
          volumeMode: 'Filesystem',
          accessModes: [ 'ReadWriteMany' ],
          persistentVolumeReclaimPolicy: 'Retain',
          storageClassName: storageClassName,
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
          storageClassName: storageClassName,
          resources: {
            requests: { storage: jenkinsAttributes.storage }
          }
        }
      });
      pvc.node.addDependency(pv);

      const jenkins = cluster.addHelmChart(stackNamespace + '-jenkins', {
        repository: 'https://charts.jenkins.io',
        chart: 'jenkins',
        release: 'jenkins',
        namespace: stackNamespace,
        createNamespace: true,
        values: {
          'persistence': {
            'enabled': true,
            'existingClaim': stackNamespace + '-pvc',
            'storageClass': storageClassName,
            'accessModes': [ 'ReadWriteMany' ],
            'size': jenkinsAttributes.storage
          }
        }
      });
      jenkins.node.addDependency(jenkinsNamespace);
    }
  }
}
