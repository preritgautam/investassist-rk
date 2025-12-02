import { RequestHandler } from 'express';

export abstract class AbstractGlobalErrorHandler {
  handler: (RequestHandler) => RequestHandler;
}
