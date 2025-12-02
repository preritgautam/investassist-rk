import { AbstractPlugin } from '../../core/plugins/AbstractPlugin';
import { ServiceContainer } from '../../core/container';
import { ConfigureOptions } from 'nunjucks';
import { TemplatePath } from './engines/ITemplateEngine';
import { NunjucksEngine } from './engines/NunjucksEngine';
import { TemplateEngineLocator } from './service/TemplateEngineLocator';
import { TemplateService } from './service/TemplateService';
import { HandlebarsEngine } from './engines/HandlebarsEngine';

export type TemplatePluginOptions = {
  defaultEngine: string,
  nunjucks: ConfigureOptions & {
    templatesPath: TemplatePath
  },
  handlebars: {
    templatesPath: string,
  }
}

export class TemplatePlugin extends AbstractPlugin {
  getDefaultNamespace() {
    return 'template';
  }

  getDefaultConfig(): {} {
    return {
      defaultEngine: 'template.engine.nunjucks',
      nunjucks: {},
    };
  }

  registerServices(serviceContainer: ServiceContainer, config: TemplatePluginOptions) {
    const { decorators: { injectable } } = serviceContainer;

    injectable({
      getDependenciesList: () => [
        config.nunjucks.templatesPath,
        config.nunjucks,
      ],
      alias: 'template.engine.nunjucks',
    })(NunjucksEngine);


    injectable({
      getDependenciesList: () => [
        config.handlebars.templatesPath,
        {},
      ],
      alias: 'template.engine.handlebars',
    })(HandlebarsEngine);

    injectable()(TemplateEngineLocator);

    injectable({
      getDependenciesList: async (resolve) => [
        await resolve(TemplateEngineLocator),
        config.defaultEngine,
      ],
    })(TemplateService);
  }
}
