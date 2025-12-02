import * as Handlebars from 'handlebars';
import { AbstractTemplateEngine, TemplatePath } from './ITemplateEngine';
import { promises as fsPromises } from 'fs';
import * as path from 'path';

const cache = {};


export class HandlebarsEngine extends AbstractTemplateEngine {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setup(templatesPath: TemplatePath, options: any = {}) {
    // nothing to do here
  }

  async render(templateName: string, context: object): Promise<string> {
    if (!cache[templateName]) {
      const rawTemplate = await this.getTemplate(templateName);
      cache[templateName] = Handlebars.compile(rawTemplate);
    }
    return cache[templateName](context);
  }

  private async getTemplate(templateName: string): Promise<string> {
    const fileHandle = await fsPromises.open(
      path.join(<string>(this.templatesPath), templateName),
      'r',
    );
    try {
      return (await fileHandle.readFile()).toString();
    } finally {
      await fileHandle.close();
    }
  }
}
