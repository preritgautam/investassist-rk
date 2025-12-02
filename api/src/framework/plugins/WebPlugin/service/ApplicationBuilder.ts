import 'reflect-metadata';
import * as express from 'express';
import { Application, NextFunction, Request, Response, Router } from 'express';
import { ApplicationMiddlewareServiceLocator } from './ApplicationMiddlewareServiceLocator';
import { AbstractApplicationMiddleware } from '../middlewares/AbstractApplicationMiddleware';
import { ControllerLocator } from './ControllerLocator';
import { ControllerKey, ControllerOptions } from '../decorators/controller';
import { AbstractController } from './AbstractController';
import { ActionKey } from '../decorators/action';
import { MiddlewareServiceLocator } from './MiddlewareServiceLocator';
import { AbstractMiddleware } from '../middlewares/AbstractMiddleware';
import { Container } from '../../../core/container';
import { RequestDecoratorKey } from '../decorators/request';
import { ResponseDecoratorKey } from '../decorators/response';
import { NextDecoratorKey } from '../decorators/next';
import { QueryDecoratorKey } from '../decorators/query';
import { HeadersDecoratorKey } from '../decorators/headers';
import { BodyDecoratorKey } from '../decorators/body';
import { ParamsDecoratorKey } from '../decorators/params';
import { aeh } from '../middlewares/aeh';
import { RequestContext } from '../RequestContext';
import * as colors from 'colors/safe';
import { GlobalErrorHandlerLocator } from './GlobalErrorHandlerLocator';
import { AbstractGlobalErrorHandler } from '../middlewares/AbstractGlobalErrorHandler';
import { ServiceDecoratorKey } from '../decorators/service';


export type ApplicationOptions = {
  staticPath?: string,
}

type RouterDefinition = {
  route: string,
  router: Router,
  parent: AbstractController,
  self: AbstractController
}

function paramsCatcher(req, res, next) {
  // @ts-ignore
  req.allParams = {
    // @ts-ignore
    ...(req.allParams || {}),
    ...req.params,
  };
  next();
}

function requestContextBuilder(req: Request, res: Response, next: NextFunction) {
  const context = new RequestContext(req, res);
  RequestContext.getStorage().run(context, next, undefined);
}

export class ApplicationBuilder {
  constructor(
    private readonly options: ApplicationOptions = {},
    private readonly applicationMiddlewaresLocator: ApplicationMiddlewareServiceLocator,
    private readonly middlewaresLocator: MiddlewareServiceLocator,
    private readonly controllerLocator: ControllerLocator,
    private readonly globalErrorHandlerLocator: GlobalErrorHandlerLocator,
    private readonly container: Container,
  ) {
  }

  async build() {
    const app: Application = express();
    const middlewares: AbstractApplicationMiddleware[] = await this.applicationMiddlewaresLocator.resolveAll();

    for (const middleware of middlewares) {
      if (middleware.mount) {
        middleware.mount(app);
      } else {
        const mw = middleware.middleware || middleware.get();
        if (mw) {
          app.use(mw);
        }
      }
    }

    if (this.options.staticPath) {
      app.use(express.static(this.options.staticPath));
    }

    await this.buildControllers(app);

    return app;
  }

  private async buildControllers(app: Application) {
    const controllers: AbstractController[] = await this.controllerLocator.resolveAll();
    const routerDefinitions: Map<AbstractController, RouterDefinition> = new Map;
    for (const controller of controllers) {
      routerDefinitions.set(
        controller,
        await this.buildControllerRouter(controller),
      );
    }

    for (const { router, route, parent } of routerDefinitions.values()) {
      if (parent) {
        const { router: parentRouter } = routerDefinitions.get(parent);
        parentRouter.use(route, paramsCatcher, router);
      }
    }

    const rootRouters = Array.from(routerDefinitions.values()).filter(({ parent }) => !parent);

    for (const rootRouter of rootRouters) {
      app.use(
        rootRouter.route,
        paramsCatcher,
        requestContextBuilder,
        rootRouter.router,
      );
    }
  }

  private async buildControllerRouter(controller: AbstractController): Promise<RouterDefinition> {
    // eslint-disable-next-line new-cap
    const router = express.Router();

    const controllerOptions = Reflect.getOwnMetadata(ControllerKey, controller.constructor);
    const { route, middlewares, parent }: ControllerOptions = controllerOptions;
    console.log(colors.magenta(`Building route: ${route}`));

    const resolvedMiddlewares: AbstractMiddleware[] = await Promise.all(
      (middlewares || []).map((mw) => {
        if (typeof mw === 'string') {
          const runtimeMiddleware = (req: Request, res: Response, next: NextFunction) => {
            this.middlewaresLocator.resolve2(mw).then((_amw: AbstractMiddleware) => {
              return _amw.middleware(req, res, next);
            });
          };
          return {
            middleware: runtimeMiddleware,
          };
        }

        return this.middlewaresLocator.resolve(mw);
      }),
    );

    const globalErrorHandlers = await this.globalErrorHandlerLocator.resolveAll();
    if (globalErrorHandlers.length > 1) {
      throw new Error('Found multiple GlobalErrorHandlers defined. You can have only one as of now.');
    }
    const globalErrorHandler: AbstractGlobalErrorHandler = globalErrorHandlers[0] || null;


    for (const middleware of resolvedMiddlewares) {
      const mw = middleware.middleware;
      if (mw) {
        router.use(aeh(globalErrorHandler.handler(mw)));
      }
    }

    await this.buildControllerActions(controller, router);

    return {
      router,
      route,
      parent: parent ? await this.controllerLocator.resolve(parent) : null,
      self: controller,
    };
  }

  private async buildControllerActions(controller: AbstractController, router) {
    const actions = Reflect.getOwnMetadata(ActionKey, controller.constructor.prototype);

    if (actions) {
      for (const action of actions) {
        const { propertyKey, options: { route, methods, middlewares } } = action;
        console.log(colors.cyan(
          `  ${colors.white('building action:')} [${colors.yellow((methods || ['all']).join(', '))}] ${route || '/'}`,
        ));
        const resolvedMiddlewares: AbstractMiddleware[] = await Promise.all(
          (middlewares || []).map((amw) => {
            // check for runtime middlewares
            if (typeof amw === 'string') {
              const runtimeMiddleware = (req: Request, res: Response, next: NextFunction) => {
                this.middlewaresLocator.resolve2(amw).then((_amw: AbstractMiddleware) => {
                  return _amw.middleware(req, res, next);
                });
              };
              return {
                middleware: runtimeMiddleware,
              };
            }
            return this.middlewaresLocator.resolve(amw);
          }),
        );

        const globalErrorHandlers = await this.globalErrorHandlerLocator.resolveAll();
        if (globalErrorHandlers.length > 1) {
          throw new Error('Found multiple GlobalErrorHandlers defined. You can have only one as of now.');
        }
        const globalErrorHandler: AbstractGlobalErrorHandler = globalErrorHandlers[0] || null;

        const middlewaresToApply = resolvedMiddlewares
          .map((mw) => mw.middleware)
          .filter((mw) => mw)
          .map((mw) => aeh(globalErrorHandler.handler(mw)));

        const methodsToApply = methods || ['use'];

        const requestHandler = async (req: Request, res: Response, next: NextFunction) => {
          // get if any thing that needs to be injected
          const injectRequestOptions =
            Reflect.getOwnMetadata(RequestDecoratorKey, controller.constructor.prototype, propertyKey);
          const injectResponseOptions =
            Reflect.getOwnMetadata(ResponseDecoratorKey, controller.constructor.prototype, propertyKey);
          const injectNextOptions =
            Reflect.getOwnMetadata(NextDecoratorKey, controller.constructor.prototype, propertyKey);
          const injectQueryOptions =
            Reflect.getOwnMetadata(QueryDecoratorKey, controller.constructor.prototype, propertyKey);
          const injectHeadersOptions =
            Reflect.getOwnMetadata(HeadersDecoratorKey, controller.constructor.prototype, propertyKey);
          const injectBodyOptions =
            Reflect.getOwnMetadata(BodyDecoratorKey, controller.constructor.prototype, propertyKey);
          const injectServiceOptions =
            Reflect.getOwnMetadata(ServiceDecoratorKey, controller.constructor.prototype, propertyKey);
          const injectParamsOptions =
            Reflect.getOwnMetadata(ParamsDecoratorKey, controller.constructor.prototype, propertyKey);

          const injections =
            Reflect.getOwnMetadata(this.container.containerId, controller.constructor.prototype, propertyKey);

          const paramsToInject = [];

          if (injectRequestOptions) {
            for (const injectOptions of injectRequestOptions) {
              paramsToInject[injectOptions.parameterIndex] = injectOptions.key === undefined ?
                req : req[injectOptions.key];
            }
          }

          if (injectResponseOptions) {
            paramsToInject[injectResponseOptions.parameterIndex] = res;
          }

          if (injectNextOptions) {
            paramsToInject[injectNextOptions.parameterIndex] = next;
          }

          if (injectQueryOptions) {
            for (const injectOptions of injectQueryOptions) {
              const value = injectOptions.key === undefined ?
                req.query : req.query[injectOptions.key];
              if (injectOptions.transform) {
                paramsToInject[injectOptions.parameterIndex] = await injectOptions.transform(value);
              } else {
                paramsToInject[injectOptions.parameterIndex] = value;
              }
            }
          }

          if (injectHeadersOptions) {
            for (const injectOptions of injectHeadersOptions) {
              paramsToInject[injectOptions.parameterIndex] = injectOptions.key === undefined ?
                req.headers : req.headers[injectOptions.key];
            }
          }

          if (injectBodyOptions) {
            for (const injectOptions of injectBodyOptions) {
              const value = injectOptions.key === undefined ? req.body : req.body[injectOptions.key];
              paramsToInject[injectOptions.parameterIndex] =
                value !== undefined && injectOptions.transform ?
                  injectOptions.transform(value) :
                  value;
            }
          }

          if (injectServiceOptions) {
            for (const injectOptions of injectServiceOptions) {
              paramsToInject[injectOptions.parameterIndex] = await this.container.resolve2(injectOptions.key);
            }
          }

          if (injectParamsOptions) {
            for (const injectOptions of injectParamsOptions) {
              if (injectOptions.key === undefined) {
                paramsToInject[injectOptions.parameterIndex] =
                  // @ts-ignore
                  injectOptions.checkAllParams ? { ...req.allParams, ...req.params } : req.params;
              } else {
                paramsToInject[injectOptions.parameterIndex] =
                  // @ts-ignore
                  injectOptions.checkAllParams ?
                    // @ts-ignore
                    req.params[injectOptions.key] || req.allParams[injectOptions.key] :
                    req.params[injectOptions.key];
              }
            }
          }

          if (injections) {
            for (const injectOptions of injections) {
              const { index, type } = injectOptions;
              paramsToInject[index] = await this.container.resolve(type);
            }
          }

          if (paramsToInject.length) {
            await controller[propertyKey].call(controller, ...paramsToInject);
          } else {
            await controller[propertyKey].call(controller, req, res, next);
          }
        };

        for (const method of methodsToApply) {
          router[method](
            route || '/',
            middlewaresToApply,
            globalErrorHandler ? aeh(globalErrorHandler.handler(requestHandler)) : aeh(requestHandler),
          );
        }
      }
    }
  }
}
