import { AbstractEventListener, EventHandler } from '../../../framework/plugins/EventPlugin';
import { inject, injectable } from '../../boot';
import { JobsService } from '../../../framework/plugins/JobPlugin/JobsService';
import { MailsManager } from '../../service/MailsManager';
import { ResetPasswordTokenGenerated } from '../../../bootstrap/events/events/AuthEvents';

@injectable()
export class AuthEventsListener extends AbstractEventListener {
  constructor(
    @inject(JobsService) private readonly jobService: JobsService,
    @inject(MailsManager) private readonly mailsManager: MailsManager,
  ) {
    super();
  }

  getSubscribedEvents(): { [p: string]: EventHandler } {
    return {
      [ResetPasswordTokenGenerated.Type]: this.onResetPasswordTokenGenerated.bind(this),
    };
  }

  async onResetPasswordTokenGenerated(event: ResetPasswordTokenGenerated) {
    const mailOptions = await this.mailsManager.resetPasswordRequestedMailData(event.user, event.token);
    await this.jobService.dispatch('mail', mailOptions);
  }
}
