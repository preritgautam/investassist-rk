import { AbstractApplicationMiddleware } from '../../WebPlugin/middlewares/AbstractApplicationMiddleware';
import { SecurityService } from '../service/SecurityService';

export class UsePassport extends AbstractApplicationMiddleware {
  constructor(private readonly securityService: SecurityService) {
    super();
  }

  get() {
    return this.securityService.getMiddleware();
  }
}
