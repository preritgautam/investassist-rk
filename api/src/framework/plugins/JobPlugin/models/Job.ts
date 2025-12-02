export class Job {
  constructor(
    public readonly name: string,
    public readonly data: any,
    public readonly options: any,
    public readonly engineJob?: any,
  ) {
  }
}
