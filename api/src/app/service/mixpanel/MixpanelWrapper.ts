import { injectable } from '../../boot';
import * as Mixpanel from 'mixpanel';
import { RequestContext } from '../../../framework/plugins/WebPlugin';
import { IUser } from '../../../bootstrap/models/IUser';

export interface EventDeals extends Record<string, any> {
  // eslint-disable-next-line camelcase
  distinct_id?: string,
  ip?: string,
}

@injectable()
export class MixpanelWrapper {
  private readonly mixpanel: Mixpanel.Mixpanel;

  constructor(
    token: string,
    options: Mixpanel.InitConfig,
  ) {
    this.mixpanel = Mixpanel.init(token, options);
  }

  private static getUserDetails() {
    const ctx: RequestContext = RequestContext.get();
    const userId = (ctx.req.user as IUser).id;
    const ip = ctx.req.ip;
    return { distinct_id: userId, ip };
  }

  async track(event: string, deals: EventDeals, trackUser: boolean = true) {
    if (trackUser) {
      this.mixpanel.track(event, { ...deals, ...MixpanelWrapper.getUserDetails() });
    } else {
      this.mixpanel.track(event, deals);
    }
  }
}
