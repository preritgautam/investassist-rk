import { AbstractController, controller, response, get } from '../../../framework/plugins/WebPlugin';
import { Response } from 'express';

@controller({ route: '/api/status' })
export class StatusController extends AbstractController {
  @get()
  status(@response() res: Response) {
    res.json({
      status: 'ok',
    });
  }
}
