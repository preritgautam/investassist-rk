import { AbstractPlugin } from '../../core/plugins/AbstractPlugin';
import { FactoryName, ServiceContainer } from '../../core/container';
import { JwtConfig } from './models/JwtConfig';
import { JwtAuthStrategyFactory, JwtAuthStrategyFactoryOptions } from './factory/JwtAuthStrategyFactory';
import { LocalAuthStrategyFactory, LocalAuthStrategyFactoryOptions } from './factory/LocalAuthStrategyFactory';
import { PasswordService } from './service/PasswordService';
import { HashService } from './service/HashService';
import { Random } from './service/Random';
import { JwtService } from './service/JwtService';
import { SecurityService } from './service/SecurityService';
import { AuthStrategyFactoryLocator } from './factory/AuthStrategyFactoryLocator';
import { BasicAuthStrategyFactory } from './factory/BasicAuthStrategyFactory';
import { UsePassport } from './middlewares/UsePassport';
import { Encryption } from './service/Encryption';


export type FactoryOptions = LocalAuthStrategyFactoryOptions | JwtAuthStrategyFactoryOptions | any;

export type FirewallOptions = {
  factory: FactoryName,
  options: FactoryOptions,
  userProvider: FactoryName,
}

export type SecurityPluginOptions = {
  // TODO: _set passport initialize options
  passport: any,
  jwt: JwtConfig,
  firewalls: Record<string, FirewallOptions>
}

export class SecurityPlugin extends AbstractPlugin {
  getDefaultNamespace() {
    return 'security';
  }

  getDefaultConfig(): SecurityPluginOptions {
    return {
      passport: undefined,
      jwt: {
        issuer: 'security-plugin',
        secret: 'change-me',
        expiresIn: 24 * 60 * 60,
      },
      firewalls: {},
    };
  }

  registerServices(serviceContainer: ServiceContainer, options: SecurityPluginOptions) {
    const { decorators: { injectable } } = serviceContainer;

    injectable()(Random);
    injectable()(HashService);
    injectable({
      getDependenciesList: async (resolve) => [
        await resolve(HashService),
        await resolve(Random),
      ],
    })(PasswordService);
    injectable()(JwtService);

    injectable({
      getDependenciesList: async (resolve) => [
        await resolve(JwtService),
      ],
      alias: `${this._namespace}.auth.JwtAuthStrategyFactory`,
    })(JwtAuthStrategyFactory);

    injectable({
      getDependenciesList: async (resolve) => [
        await resolve(PasswordService),
      ],
      alias: `${this._namespace}.auth.LocalAuthStrategyFactory`,
    })(LocalAuthStrategyFactory);

    injectable({
      getDependenciesList: async (resolve) => [
        await resolve(PasswordService),
      ],
      alias: `${this._namespace}.auth.BasicAuthStrategyFactory`,
    })(BasicAuthStrategyFactory);

    injectable({
      getDependenciesList: async (resolve) => [
        serviceContainer,
        await resolve(AuthStrategyFactoryLocator),
        options,
        `${this._namespace}.auth`,
      ],
    })(SecurityService);

    injectable({
      getDependenciesList: async (resolve) => [
        await resolve(SecurityService),
      ],
    })(UsePassport);

    injectable()(AuthStrategyFactoryLocator);
    injectable()(Encryption);
  }

  async start(serviceContainer: ServiceContainer): Promise<void> {
    const securityService: SecurityService = await serviceContainer.container.resolve(SecurityService);
    await securityService.useFirewalls();
  }
}
