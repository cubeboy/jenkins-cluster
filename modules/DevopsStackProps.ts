import { StackProps } from 'aws-cdk-lib';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster } from 'aws-cdk-lib/aws-eks';

export interface DevOpsStackProps extends StackProps {
  vpc: IVpc;
  cluster?: Cluster;
}