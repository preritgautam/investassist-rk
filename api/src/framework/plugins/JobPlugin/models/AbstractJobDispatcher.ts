export abstract class AbstractJobDispatcher {
  abstract dispatch(jobName: string, jobData: any, options: any)
}
