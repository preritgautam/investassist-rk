export type TemplatePath = string | string[];

export abstract class AbstractTemplateEngine {
  protected constructor(
    protected readonly templatesPath: TemplatePath,
    protected readonly options: any,
  ) {
    this.setup(templatesPath, options);
  }

  abstract setup(templatesPath: TemplatePath, options: any): void;

  abstract render(templateName: string, context: object): Promise<string>;
}
