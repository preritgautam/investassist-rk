import { NextFunction, Request, RequestHandler, Response } from 'express';
import { AbstractGlobalErrorHandler } from '../../framework/plugins/WebPlugin/middlewares/AbstractGlobalErrorHandler';
import { injectable } from '../boot';
import { DuplicateEntryError } from '../../bootstrap/service/entity/EntityService';
import { camelToSentence } from '../../bootstrap/service/utils';
import { FormError } from '../../bootstrap/errors/FormError';
import { InvalidCredentialsError } from '../../framework/plugins/SecurityPlugin/errors/InvalidCredentialsError';
import { AccountDisabledError } from '../errors/AccountDisabledError';

@injectable()
export class GlobalErrorHandler extends AbstractGlobalErrorHandler {
  handler = (requestHandler: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        return await requestHandler(req, res, (err) => {
          if (err) {
            return GlobalErrorHandler.handleError(err, res, next);
          } else {
            next();
          }
        });
      } catch (e) {
        return GlobalErrorHandler.handleError(e, res, next);
      }
    };
  };

  private static handleError(e, res: Response, next: NextFunction) {
    if (e instanceof DuplicateEntryError) {
      const errorDetails = {};
      if (e.columns.length === 1) {
        errorDetails['fields'] = {
          [e.columns[0]]: `A ${camelToSentence(e.entityName)} object already exists with this value.`,
        };
      } else {
        errorDetails['form'] =
          `A ${camelToSentence(e.entityName)} object already exists with same values for ${e.columns.join(', ')}`;
      }
      return res.status(400).send(errorDetails);
    }

    if (e instanceof FormError) {
      return res.status(400).send({
        status: 'error',
        type: 'formError',
        errors: {
          form: e.formErrors,
          fields: e.fieldErrors,
        },
      });
    }

    if (e instanceof AccountDisabledError) {
      return res.status(403).send({
        status: 'error',
        type: 'accountDisabledError',
      });
    }

    if (e instanceof InvalidCredentialsError) {
      return res.status(401).send({
        status: 'error',
        type: 'formError',
        errors: {
          error: 'Invalid credentials provided',
          form: ['Invalid credentials provided'],
        },
      });
    }

    // let the default handler take care of it
    next(e);
  }
}
