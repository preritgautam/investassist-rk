export class CommandNotFoundError extends Error {
  constructor(readonly commandName) {
    super(`Invalid command ${commandName} requested.`);
  }
}
