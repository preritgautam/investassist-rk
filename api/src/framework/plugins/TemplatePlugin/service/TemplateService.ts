import { TemplateEngineLocator } from './TemplateEngineLocator';
import { AbstractTemplateEngine } from '../engines/ITemplateEngine';

export class TemplateService {
  constructor(
    private readonly templateEngineLocator: TemplateEngineLocator,
    private readonly defaultEngine,
  ) {
  }

  async render(templateName: string, context: object, engine = null): Promise<string> {
    try {
      const engineToUse = engine || this.defaultEngine;
      const templateEngine: AbstractTemplateEngine = await this.templateEngineLocator.resolve2(engineToUse);
      return templateEngine.render(templateName, context);
    } catch (e) {
      console.error(e);
    }
  }
}
