import { RequestHandler } from 'express';

export abstract class AbstractMiddleware {
  middleware: RequestHandler | null = null;
}
