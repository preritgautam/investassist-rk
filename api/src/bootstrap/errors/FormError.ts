export class FormError extends Error {
  constructor(public readonly formErrors: string[] = [], public readonly fieldErrors = {}) {
    super();
  }
}
