import { AbstractJobHandler } from '../../framework/plugins/JobPlugin/AbstractJobHandler';
import { inject, injectable } from '../boot';
import { Job } from '../../framework/plugins/JobPlugin/models/Job';
import { MailService } from '../../framework/plugins/MailerPlugin/service/MailService';

@injectable({ alias: 'job.mail.handler' })
export class MailJobHandler extends AbstractJobHandler {
  constructor(@inject(MailService) private readonly mailService: MailService) {
    super();
  }

  async handleJob(job: Job) {
    await this.mailService.sendMail(job.data);
  }
}
