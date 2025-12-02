import { inject, injectable } from '../boot';
import { Command } from '../../framework/plugins/CommandPlugin';
import { OptionDefinition } from 'command-line-args';
import { AccountService } from '../service/entity/AccountService';
import { IsNull } from 'typeorm';
import { Account } from '../db/entity/Account';
import { AccountManager } from '../service/manager/AccountManager';
import { map, parallel, tryit } from 'radash';

export interface InitializeBillingCommandOptions {
  dry: boolean;
}

@injectable()
export class InitializeBillingCommand extends Command {
  public static Command = 'app:init:billing';

  constructor(
    @inject(AccountService) private readonly accountService: AccountService,
    @inject(AccountManager) private readonly accountManager: AccountManager,
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

    const accounts = await this.accountService.getRepository().find({
      where: {
        status: 'Paid',
        // eslint-disable-next-line new-cap
        stripeCustomerId: IsNull(),
      },
    });

    await tryit(parallel)(
      3, accounts, (account: Account) => this.accountManager.ensureCGAccountData(account),
    );

    const withValidCGAccounts = accounts.filter((account: Account) => account.name);
    const withInvalidCGAccounts = accounts.filter((account: Account) => !account.name);

    console.log('Updating following accounts..');
    withValidCGAccounts.forEach((account: Account) => {
      console.log(`Account: ${account.name}\t\tId: ${account.id}`);
    });

    console.log('Not updating following accounts..');
    withInvalidCGAccounts.forEach((account: Account) => {
      console.log(`Account: ${account.name}\t\tId: ${account.id}`);
    });

    if (!dry) {
      await map(withValidCGAccounts, async (account: Account) => {
        account.status = 'Free';
        await this.accountService.save(account, null);
      });
      console.log('Done updating accounts.');
    } else {
      console.log('Did not update anything, it was a dry run.');
    }
  }
}
