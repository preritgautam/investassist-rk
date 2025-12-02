/**
 * Greeting command
 * Run as:
 *  npm run cli app:greeting                => 'Hello, World!'
 *  npm run cli app:greeting -- -n John     => 'Hello, John!'
 *  npm run cli app:greeting -- --name John => 'Hello, John!'
 *  npm run cli app:greeting -- John        => 'Hello, John!'
 */
import { inject, injectable } from '../boot';
import { Command } from '../../framework/plugins/CommandPlugin';
import { JobsService } from '../../framework/plugins/JobPlugin/JobsService';
import { SuperAdminAuthService } from '../service/auth/SuperAdminAuthService';
import { Logger } from 'winston';
import { injectLogger } from '../../framework/plugins/LoggingPlugin/decorators/injectLogger';

@injectable()
class GreetingCommand extends Command {
  public static Command = 'app:greeting';

  constructor(
    @inject(JobsService) private readonly jobService: JobsService,
    @inject(SuperAdminAuthService) private readonly authService: SuperAdminAuthService,
    @injectLogger('logging.logger.default') private readonly logger: Logger,
  ) {
    super();
  }

  protected getOptions(): any[] {
    return [
      { name: 'name', defaultOption: true, alias: 'n', defaultValue: 'World' },
    ];
  }

  protected async run(options) {
    const { name } = options;
    const greeting = `Hello, ${name}!`;

    this.logger.log('info', {
      message: 'Hulloa, World!!',
      greeting,
    });

    console.log(greeting);
  }
}

export {
  GreetingCommand,
};
