import { FactoryName, FactoryOptions, FilteredServiceLocator, Type } from '../../../core/container';
import { Command } from '../model/Command';
import { CommandNotFoundError } from '../errors/CommandNotFoundError';

interface CommandType extends Type<Command> {
  Command: string
}

export class CommandServiceLocator extends FilteredServiceLocator {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filter(name: FactoryName, options: FactoryOptions): boolean {
    return typeof name === 'function' && name.prototype instanceof Command;
  }


  async findCommand(commandName: string) {
    const factory = this.getSupportedServices().find(
      (factoryName: CommandType) => typeof factoryName === 'function' && factoryName.Command === commandName,
    );

    if (!factory) {
      throw new CommandNotFoundError(commandName);
    }
    return this.resolve(factory);
  }
}
