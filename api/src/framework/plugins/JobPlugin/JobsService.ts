import { JobDispatcherLocator } from './service/JobDispatcherLocator';
import { AbstractJobDispatcher } from './models/AbstractJobDispatcher';

export class JobsService {
  constructor(
    private readonly jobDispatcherLocator: JobDispatcherLocator,
    private readonly defaultEngine,
  ) {
  }

  async dispatch(jobName: string, jobData: any, options: any = {}, engine: string = null) {
    const engineName = engine || this.defaultEngine;
    const dispatcher: AbstractJobDispatcher = await this.jobDispatcherLocator.resolve2(engineName);
    return dispatcher.dispatch(jobName, jobData, options);
  }
}
