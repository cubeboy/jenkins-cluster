import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ClusterStackProps } from '../modules/ClusterStackProps';

export class CdkCicdStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props: ClusterStackProps) {
    super(scope, id, props);

    const cluster = props.cluster;
    const stackNamesapce = props.stackNamespace;
    if(cluster) {
      const jenkinsNamespace = cluster.addManifest(stackNamesapce + '-namespace', {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: { name: stackNamesapce },
      });

      const jenkins = cluster.addHelmChart(stackNamesapce + '-jenkins', {
        repository: 'https://charts.jenkins.io',
        chart: 'jenkins',
        release: 'jenkins',
        namespace: stackNamesapce,
        createNamespace: true,
        values: {
          'persistence': {
            'enabled': true,
            'existingClaim': 'jenkins-pvc',
            'storageClass': 'efs-sc',
            'accessModes': [ 'ReadWriteMany' ],
            'size': '2Gi'
          }
        }
      });
      jenkins.node.addDependency(jenkinsNamespace);
    }
  }
}
