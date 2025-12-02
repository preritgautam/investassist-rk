import { FactoryName, ServiceContainer } from '../../../core/container';
import { AuthStrategyFactoryLocator } from '../factory/AuthStrategyFactoryLocator';
import { AbstractAuthStrategyFactory } from '../factory/AbstractAuthStrategyFactory';
import * as passport from 'passport';
import { FirewallOptions, SecurityPluginOptions } from '../SecurityPlugin';

export class SecurityService {
  constructor(
    private readonly container: ServiceContainer,
    private readonly authStrategyFactoryLocator: AuthStrategyFactoryLocator,
    private readonly securityPluginOptions: SecurityPluginOptions,
    private readonly authMiddlewareNamePrefix: string,
  ) {
  }

  async createStrategy(factoryName: FactoryName, userProviderName: FactoryName, options: any) {
    const factory: AbstractAuthStrategyFactory = await this.authStrategyFactoryLocator.resolve2(factoryName);
    const userProvider = await this.container.container.resolve2(userProviderName);
    return await factory.createStrategy(userProvider, options);
  }

  getMiddleware() {
    return passport.initialize(this.securityPluginOptions.passport);
  }

  async useFirewalls() {
    const firewallConfig: Record<string, FirewallOptions> = this.securityPluginOptions.firewalls;
    for (const sn of Reflect.ownKeys(firewallConfig)) {
      const strategyName = sn.toString();
      const strategy = await this.createStrategy(
        firewallConfig[strategyName].factory,
        firewallConfig[strategyName].userProvider,
        firewallConfig[strategyName].options,
      );

      passport.use(strategyName, strategy);

      const middleware = await this.createMiddleware(strategyName, firewallConfig[strategyName].factory);
      this.container.decorators.injectable({
        alias: `${this.authMiddlewareNamePrefix}.${strategyName}`,
      })(middleware);
    }
  }

  async createMiddleware(strategyName: string, factoryName: FactoryName) {
    const factory: AbstractAuthStrategyFactory = await this.authStrategyFactoryLocator.resolve2(factoryName);
    return factory.createMiddleware(strategyName);
  }

  async createToken(firewallName: string, payload: any) {
    const firewallConfig: Record<string, FirewallOptions> = this.securityPluginOptions.firewalls;
    const { factory: name, options } = firewallConfig[firewallName];
    const factory: AbstractAuthStrategyFactory = await this.authStrategyFactoryLocator.resolve2(name);
    return factory.createToken(payload, options);
  }

  async verifyToken(firewallName: string, token: string) {
    const firewallConfig: Record<string, FirewallOptions> = this.securityPluginOptions.firewalls;
    const { factory: name, options } = firewallConfig[firewallName];
    const factory: AbstractAuthStrategyFactory = await this.authStrategyFactoryLocator.resolve2(name);
    return factory.verifyToken(token, options);
  }
}
