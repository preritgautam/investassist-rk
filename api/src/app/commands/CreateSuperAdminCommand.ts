import { Command } from '../../framework/plugins/CommandPlugin';
import { OptionDefinition } from 'command-line-args';
import { inject, injectable } from '../boot';
import { SuperAdminService } from '../service/entity/SuperAdminService';
import { SuperAdmin } from '../db/entity/SuperAdmin';

type CreateSuperAdminCommandOptions = {
  id?: string,
  name: string,
  email: string,
  password: string,
  help?: boolean,
}

@injectable()
export class CreateSuperAdminCommand extends Command {
  public static Command = 'app:create:super_admin';

  constructor(
    @inject(SuperAdminService) private readonly superAdminService: SuperAdminService,
  ) {
    super();
  }

  protected getOptions(): OptionDefinition[] {
    return [
      { name: 'name', alias: 'n' },
      { name: 'email', alias: 'e' },
      { name: 'password', alias: 'p' },
      { name: 'help', alias: 'h', type: Boolean },
    ];
  }

  protected async run(options: CreateSuperAdminCommandOptions) {
    const { id, name, email, password, help } = options;

    if (help) {
      this.showHelp();
      return;
    }

    const sysAdmin = new SuperAdmin();
    sysAdmin.id = id;
    sysAdmin.email = email;
    sysAdmin.name = name;
    sysAdmin.roles = ['SUPER_ADMIN'];
    this.superAdminService.setSecret(sysAdmin, password);

    await this.superAdminService.getRepository().save(sysAdmin);
    console.log(`Created super admin with name: ${name} and email: ${email}`);
  }


  protected getDoc(): any[] {
    return [
      {
        header: 'Create Super Admin',
        content: 'This command creates a super admin record',
      },
      {
        header: 'Synopsis',
        content: [
          `$ ${this.getRunCommand()} -- -h`,
          `$ ${this.getRunCommand()} -- -n <name> -e <email> -p <password>`,
        ],
      },
      {
        header: 'Options',
        optionList: [
          {
            name: 'help',
            alias: 'h',
            description: 'Show this help',
          },
          {
            name: 'name',
            alias: 'n',
            typeLabel: '{underline string}',
            description: 'The name of the admin user',
          },
          {
            name: 'email',
            alias: 'e',
            typeLabel: '{underline string}',
            description: 'The email of the admin user',
          },
          {
            name: 'password',
            alias: 'p',
            typeLabel: '{underline string}',
            description: 'The password of the admin user',
          },
        ],
      },
    ];
  }
}
