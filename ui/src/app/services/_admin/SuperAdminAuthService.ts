import { Service } from '../../../bootstrap/service/Service';
import {
  changeAdminPasswordApi,
  createAdminTokenApi,
  forgotAdminPasswordApi,
  logoutAdminApi,
  resetAdminPasswordApi,
  validateAdminSessionApi,
} from '../../api/_admin';
import { adminSession } from '../../../userSession';

export type LoginCredentials = {
  email: string,
  password: string
}

export type ForgotPasswordParams = {
  email: string,
}

export type ResetPasswordProps = {
  email: string,
  token: string,
  newPassword: string
}

export type UpdatePasswordProps = {
  currentPassword: string,
  newPassword: string,
}

export type LoginReturn = {
  user: object,
}

export class SuperAdminAuthService extends Service {
  async loginAdmin({ email, password }: LoginCredentials): Promise<LoginReturn> {
    const { data: { data: { user, token, timestamp } } } =
      await createAdminTokenApi({ data: { email, password } });
    adminSession.authManager.startSession({ user, token, timestamp, userData: null, session: null });
    return { user };
  }

  async validateAdminSession(): Promise<LoginReturn> {
    try {
      const { data: { data: { user } } } = await validateAdminSessionApi();
      return user;
    } catch (e) {
      throw new Error('Invalid Session');
    }
  };

  async logout(): Promise<any> {
    await logoutAdminApi().catch(console.warn);
    adminSession.authManager.endSession();
  }

  async forgotPassword({ email }: ForgotPasswordParams) {
    return forgotAdminPasswordApi({ data: { email } });
  }

  async resetPassword({ email, token, newPassword }: ResetPasswordProps) {
    return resetAdminPasswordApi({ data: { email, token, newPassword } });
  }

  async updatePassword({ currentPassword, newPassword }: UpdatePasswordProps) {
    return changeAdminPasswordApi({ data: { newPassword, currentPassword } });
  }
}

export const useSuperAdminAuthService: () => SuperAdminAuthService = () => SuperAdminAuthService.useService();

