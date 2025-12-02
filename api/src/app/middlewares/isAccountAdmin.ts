import { injectable } from '../boot';
import { AbstractMiddleware } from '../../framework/plugins/WebPlugin/middlewares/AbstractMiddleware';
import { RequestHandler } from 'express';
import { AccountUser } from '../db/entity/AccountUser';

@injectable()
export class isAccountAdmin extends AbstractMiddleware {
  middleware: RequestHandler = (req, res, next) => {
    const user = req?.user;
    const isAccountAdmin = user && user instanceof AccountUser && user.isRootUser;

    if (!isAccountAdmin) {
      return res.status(401).send({
        status: 'error',
        message: 'Unauthorized access',
      });
    }

    next();
  };
}
