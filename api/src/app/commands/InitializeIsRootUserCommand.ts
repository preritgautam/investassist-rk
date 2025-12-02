import { inject, injectable } from '../boot';
import { Command } from '../../framework/plugins/CommandPlugin';
import { OptionDefinition } from 'command-line-args';
import { AccountUserService } from '../service/entity/AccountUserService';
import { AccountUserManager } from '../service/manager/AccountUserManager';
import { AccountUser } from '../db/entity/AccountUser';
import { map } from 'radash';

export interface InitializeBillingCommandOptions {
  dry: boolean;
}

@injectable()
export class InitializeIsRootUserCommand extends Command {
  public static Command = 'app:accountUser:setIsRootUser';

  constructor(
    @inject(AccountUserService) private readonly accountUserService: AccountUserService,
    @inject(AccountUserManager) private readonly accountUserManager: AccountUserManager,
  ) {
    super();
  }

  protected getOptions(): OptionDefinition[] {
    return [
      { name: 'dry', alias: 'd', type: Boolean },
    ];
  }

  protected async run(options: InitializeBillingCommandOptions) {
    const { dry } = options;

    const users = await this.accountUserService.getRepository().find();
    await this.accountUserManager.ensureAccountUsersCGData(users);
    const validUsers = users.filter((user: AccountUser) => user.name);

    console.log('Updating following users..');
    validUsers.forEach((user: AccountUser) => {
      console.log(`User: ${user.name}\t\tId: ${user.id} \t\tIsRootUser: ${user.cgAccountUser?.isRootUser}`);
    });


    if (!dry) {
      await map(validUsers, async (user: AccountUser) => {
        user.isRootUser = user.cgAccountUser.isRootUser;
        await this.accountUserManager.save(user, null);
      });
      console.log('Done updating users.');
    } else {
      console.log('Did not update anything, it was a dry run.');
    }
  }
}
