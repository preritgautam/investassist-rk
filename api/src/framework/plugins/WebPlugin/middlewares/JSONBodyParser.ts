import { AbstractApplicationMiddleware } from './AbstractApplicationMiddleware';
import * as express from 'express';
import { RequestHandler } from 'express';
import { OptionsJson } from 'body-parser';

export interface JSONBodyParserOptions extends OptionsJson {
  excludeBasePaths?: string[],
}

export class JSONBodyParser extends AbstractApplicationMiddleware {
  constructor(private readonly options: JSONBodyParserOptions | false) {
    super();
  }

  get(): RequestHandler | void {
    if (this.options !== false) {
      const mw = express.json(this.options);
      return (req, res, next) => {
        // @ts-ignore
        const excludeBasePaths: string[] = this.options.excludeBasePaths;
        // if any exclude paths are specified
        if (excludeBasePaths) {
          // if any exclude path matches with request start
          if (excludeBasePaths.some((path) => req.path.startsWith(path))) {
            return next();
          }
        }
        return mw(req, res, next);
      };
    }
  }
}
