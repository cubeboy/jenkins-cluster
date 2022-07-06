import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as account from '../resources/account'
import { DevOpsStackProps } from '../modules/DevopsStackProps';

export class CdkDevopsMonitorStack extends cdk.Stack {
  
  constructor(scope: Construct, id: string, props: DevOpsStackProps) {
    super(scope, id, props);

    const cluster = props.cluster;

    if(cluster) {
      const monitoring = cluster.addManifest('monitoring', {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: { name: 'monitoring' },
      })

      cluster.addHelmChart('prometheus', {
        repository: 'https://prometheus-community.github.io/helm-charts',
        chart: 'kube-prometheus-stack',
        release: 'prometheus',
        namespace: 'monitoring',
        values: {
          'grafana': {
            enabled: false
          },
          'prometheus': {
            'service': {
              'type': 'LoadBalancer'
            }
          }
        }
      }).node.addDependency(monitoring);

      const secret = cluster.addManifest('iam-loki-s3', {
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
      secret.node.addDependency(monitoring);

      const lokiValues : any = yaml.load(fs.readFileSync('./k8s/loki-values.yaml', 'utf8')) ;
      
      cluster.addHelmChart('loki', {
        repository: 'https://grafana.github.io/helm-charts',
        chart: 'loki-stack',
        release: 'loki',
        namespace: 'monitoring',
        values: lokiValues,
      }).node.addDependency(secret);

      const productService = cluster.addManifest('product-services', {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: { name: 'product-services' },
      })

    }
  }
}
