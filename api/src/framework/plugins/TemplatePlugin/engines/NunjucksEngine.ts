import * as nunjucks from 'nunjucks';
import { ConfigureOptions } from 'nunjucks';
import { AbstractTemplateEngine, TemplatePath } from './ITemplateEngine';

export class NunjucksEngine extends AbstractTemplateEngine {
  setup(templatesPath: TemplatePath, options: ConfigureOptions = {}) {
    nunjucks.configure(templatesPath, { autoescape: true, ...options });
  }

  async render(templateName: string, context: object): Promise<string> {
    return new Promise((resolve, reject) => {
      nunjucks.render(templateName, context, function(err, res) {
        if (err) {
          reject(err);
        }

        resolve(res);
      });
    });
  }
}
