import { Request, Response } from 'express';
import { AsyncLocalStorage } from 'async_hooks';
import { uid } from 'uid/single';

export class RequestContext {
  private static asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

  public static getStorage() {
    return this.asyncLocalStorage;
  }

  public static get(): RequestContext {
    return this.asyncLocalStorage.getStore();
  }

  public readonly requestId: string;

  constructor(
    public readonly req: Request,
    public readonly res: Response,
  ) {
    this.requestId = uid(16);
  }
}

