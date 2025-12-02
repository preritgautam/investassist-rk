import { Job } from './models/Job';

export abstract class AbstractJobHandler {
  abstract handleJob(job: Job);
}
