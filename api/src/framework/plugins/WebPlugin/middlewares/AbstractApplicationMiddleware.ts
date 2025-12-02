import { RequestHandler } from 'express';

export abstract class AbstractApplicationMiddleware {
  middleware: RequestHandler | null = null;
  mount: (Application) => void = null;
  get(): RequestHandler | void {
  };
}
