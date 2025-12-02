import { StorageBuilderInterface } from './StorageBuilderInterface';
import { AwsS3Storage, AwsS3StorageOptions } from '../storage/AwsS3Storage';

export class AwsS3StorageBuilder implements StorageBuilderInterface<AwsS3StorageOptions> {
  getType(): string {
    return 'aws-s3';
  }

  build(options: AwsS3StorageOptions): AwsS3Storage {
    return new AwsS3Storage(options);
  }
}
