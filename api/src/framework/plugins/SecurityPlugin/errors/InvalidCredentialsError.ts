export class InvalidCredentialsError extends Error {
  constructor(public readonly message = 'Invalid credentials provided') {
    super(message);
  }
}
