export class UnauthorizedApiCallError extends Error {
  constructor() {
    super('Unauthorized API Call Error');
  }
}
