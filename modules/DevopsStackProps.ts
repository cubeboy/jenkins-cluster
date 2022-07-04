import { StackProps } from 'aws-cdk-lib';
import { IVpc } from 'aws-cdk-lib/aws-ec2';

export interface DevOpsStackProps extends StackProps {
  vpc: IVpc
}