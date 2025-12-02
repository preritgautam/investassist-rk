import * as commandLineArgs from 'command-line-args';
import * as commandLineUsage from 'command-line-usage';
import { OptionDefinition } from 'command-line-args';


abstract class Command {
  public static Command = '';

  public async runCommand(argv) {
    const optionDefinitions = this.getOptions();
    const options = commandLineArgs(optionDefinitions, { argv });
    await this.run(options);
  }

  protected abstract run(options);

  protected getOptions(): OptionDefinition[] {
    return [];
  }

  protected showHelp() {
    console.log(commandLineUsage(this.getDoc()));
  }

  protected getDoc() {
    return [
      {
        // @ts-ignore
        header: this.constructor.Command,
        content: 'This command does not specifies any help section.',
      },
    ];
  }

  protected getRunCommand() {
    // @ts-ignore
    return `npm run cli ${this.constructor.Command}`;
  }
}

export { Command };
