import { SuperAdmin } from '../../db/entity/SuperAdmin';
import { EntityService } from '../../../bootstrap/service/entity/EntityService';
import { PasswordService } from '../../../framework/plugins/SecurityPlugin/service/PasswordService';
import { ISecurityUserService } from '../../../framework/plugins/SecurityPlugin/models/ISecurityUserService';
import { inject, injectable } from '../../boot';
import { SuperAdminTokenService } from './SuperAdminTokenService';
import { ISecurityUserToken } from '../../../framework/plugins/SecurityPlugin/models/ISecurityUserToken';
import { IUserService } from '../../../bootstrap/service/auth/IUserService';
import { TokenType } from '../../../bootstrap/models/enums/TokenType';
import { TxnOption } from '../../../framework/plugins/TypeORMPlugin/Transaction';
import { CGSuperAdmin } from '../../types';

@injectable({
  alias: 'app.service.SuperAdminService',
})
class SuperAdminService extends EntityService<SuperAdmin> implements ISecurityUserService, IUserService {
  constructor(
    @inject(PasswordService) private readonly passwordService: PasswordService,
    @inject(SuperAdminTokenService) private readonly tokenService: SuperAdminTokenService,
  ) {
    super(SuperAdmin);
  }

  async findByUid(email: string, txnOption: TxnOption): Promise<SuperAdmin> {
    return this.getRepository(txnOption).findOne({ email });
  }

  setSecret(admin, newPassword) {
    const hashedPassword = this.passwordService.hashPassword(newPassword);
    admin.password = JSON.stringify(hashedPassword);
  }

  async findAuthToken(tokenString: string): Promise<ISecurityUserToken> {
    return await this.tokenService.findByToken(tokenString, TokenType.AUTH_TOKEN, null);
  }

  async getOrAddAdmin(cgSuperAdmin: CGSuperAdmin, txn: TxnOption) {
    let admin = await this.getRepository(txn).findOne({ email: cgSuperAdmin.email });
    if (!admin) {
      admin = new SuperAdmin();
      admin.email = cgSuperAdmin.email;
      admin.name = cgSuperAdmin.name;
      admin.roles = ['SUPER_ADMIN'];
      admin.password = 'ThisWillNeverWorkBecauseThisIsNotHashedJustAPlainStringNoHashingWillEverReturnThisThing';

      admin = await this.getRepository(txn).save(admin);
    }

    return admin;
  }
}

export { SuperAdminService };
