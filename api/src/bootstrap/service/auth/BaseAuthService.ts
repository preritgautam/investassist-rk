import { IUserService } from './IUserService';
import { IUserTokenService } from './IUserTokenService';
import { ISecurityUserToken } from '../../../framework/plugins/SecurityPlugin/models/ISecurityUserToken';
import { TxnOption } from '../../../framework/plugins/TypeORMPlugin/Transaction';
import { SecurityService } from '../../../framework/plugins/SecurityPlugin/service/SecurityService';
import { Random } from '../../../framework/plugins/SecurityPlugin/service/Random';
import { EventDispatcher } from '../../../framework/plugins/EventPlugin/service/EventDispatcher';
import { transactional } from '../../../framework/plugins/TypeORMPlugin/decorators/transactional';
import { PasswordService } from '../../../framework/plugins/SecurityPlugin/service/PasswordService';
import { IUser } from '../../models/IUser';
import { TokenType } from '../../models/enums/TokenType';
import { UserNotFoundError } from '../../errors/UserNotFoundError';
import { InvalidUserTokenError } from '../../errors/InvalidUserTokenError';
import { IUserToken } from '../../models/IUserToken';
import { PasswordUpdated, ResetPasswordTokenGenerated } from '../../events/events/AuthEvents';

export abstract class BaseAuthService {
  protected constructor(
    protected readonly userService: IUserService,
    protected readonly userTokenService: IUserTokenService,
    protected readonly random: Random,
    protected readonly securityService: SecurityService,
    protected readonly passwordService: PasswordService,
    protected readonly eventDispatcher: EventDispatcher,
  ) {
  }

  async deleteExistingTokens(user: IUser) {
    await this.userTokenService.deleteExistingAuthTokens(user);
  }

  async createAuthToken(
    user: IUser, firewallName: string, txnOptions: TxnOption,
  ): Promise<ISecurityUserToken> {
    const tokenString = await this.securityService.createToken(firewallName, this.getAuthTokenPayload(user));
    return await this.userTokenService.createUserToken(user, tokenString, TokenType.AUTH_TOKEN, txnOptions);
  }

  async verifyAuthToken(token: string, firewallName: string): Promise<object> {
    return this.securityService.verifyToken(firewallName, token);
  }

  /**
   * Create a RESET_PASSWORD_TOKEN user token and trigger an event for the same
   * @param {string} uid the user uid address
   * @param {Transaction} txnOptions
   * @throws UserNotFoundError
   */
  async requestResetSecret(uid: string, txnOptions: TxnOption) {
    const user = await this.getUserByUid(uid, txnOptions);
    const tokenString = this.random.randomString(48);
    const token: ISecurityUserToken = await this.userTokenService.createUserToken(
      user, tokenString, TokenType.RESET_PASSWORD_TOKEN, txnOptions,
    );

    await this.eventDispatcher.dispatch(new ResetPasswordTokenGenerated(user, token));
  }

  private async getUserByUid(uid: string, txnOptions: TxnOption): Promise<IUser> {
    const user: IUser = await this.userService.findByUid(uid, txnOptions);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }

  @transactional()
  async resetSecret(uid: string, tokenString: string, secret: string, txnOptions: TxnOption) {
    const user = await this.getUserByUid(uid, txnOptions);
    const token = await this.userTokenService.findByToken(tokenString, TokenType.RESET_PASSWORD_TOKEN, txnOptions);

    if (token === undefined) {
      throw new InvalidUserTokenError('InvalidResetPasswordToken');
    }

    const tokenUser = await token.user;
    if (user.id !== tokenUser.id) {
      throw new InvalidUserTokenError('InvalidResetPasswordToken');
    }

    this.userService.setSecret(user, secret);
    await this.userService.save(user, txnOptions);
    this.userTokenService.delete(token, txnOptions);
    await this.eventDispatcher.dispatch(new PasswordUpdated(user));
  }

  @transactional()
  async deleteAuthToken(token: IUserToken, transaction: TxnOption) {
    if (token.tokenType === TokenType.AUTH_TOKEN.key) {
      await this.userTokenService.delete(token, transaction);
    }
  }

  verifyPassword(user: IUser, password: string) {
    return this.passwordService.verifyPassword(password, JSON.parse(user.secret));
  }

  async updateSecret(user: IUser, password: string, txnOptions: TxnOption) {
    this.userService.setSecret(user, password);
    await this.userService.save(user, txnOptions);
    await this.eventDispatcher.dispatch(new PasswordUpdated(user));
  }

  protected getAuthTokenPayload(user: IUser) {
    return {
      id: user.id,
      uid: user.uid,
      roles: user.roles,
    };
  }
}
