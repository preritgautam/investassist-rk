export type FormErrors = {
  form?: string[],
  fields?: Record<string, string[]>
}

class FormApiError extends Error {
  public readonly errors: FormErrors;

  constructor(formErrors: FormErrors) {
    super();
    this.errors = formErrors;
  }
}

export default FormApiError;
