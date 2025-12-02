import { injectable } from '../boot';
import * as express from 'express';
import { AbstractMiddleware } from '../../framework/plugins/WebPlugin';


@injectable()
export class ExpressRawJson extends AbstractMiddleware {
  middleware = express.raw({ type: 'application/json' });
}
