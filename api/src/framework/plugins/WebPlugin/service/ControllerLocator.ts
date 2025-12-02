import { TaggedServiceLocator } from '../../../core/container';

export class ControllerLocator extends TaggedServiceLocator {
  constructor() {
    super('web.controller');
  }
}
