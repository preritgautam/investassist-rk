import { Kernel } from '../framework/core/kernel/Kernel';
import { CommandPlugin } from '../framework/plugins/CommandPlugin';
import appConfig from './config';
import { EventPlugin } from '../framework/plugins/EventPlugin/EventPlugin';
import { MailerPlugin } from '../framework/plugins/MailerPlugin/MailerPlugin';
import { SerializerPlugin } from '../framework/plugins/SerializerPlugin/SerializerPlugin';
import { WebPlugin } from '../framework/plugins/WebPlugin/WebPlugin';
import { TypeORMPlugin } from '../framework/plugins/TypeORMPlugin/TypeORMPlugin';
import { SecurityPlugin } from '../framework/plugins/SecurityPlugin/SecurityPlugin';
import { JobPlugin } from '../framework/plugins/JobPlugin/JobPlugin';
import { AppConfigPlugin } from '../framework/plugins/AppConfigPlugin/AppConfigPlugin';
import { TemplatePlugin } from '../framework/plugins/TemplatePlugin/TemplatePlugin';
import { LoggingPlugin } from '../framework/plugins/LoggingPlugin/LoggingPlugin';
import { CachePlugin } from '../framework/plugins/CachePlugin';
import { FileStoragePlugin } from '../framework/plugins/FileStoragePlugin/FileStoragePlugin';

const kernel = new Kernel({
  debug: true,
  env: 'development',
  autoloadDirs: [
    `${__dirname}/commands`,
    `${__dirname}/controllers`,
    `${__dirname}/events`,
    `${__dirname}/jobs`,
    `${__dirname}/middlewares`,
    `${__dirname}/service`,
  ],
  config: appConfig,
  silent: true,
});

kernel.addPlugin(new CommandPlugin());
kernel.addPlugin(new EventPlugin());
kernel.addPlugin(new MailerPlugin());
kernel.addPlugin(new SerializerPlugin());
kernel.addPlugin(new SecurityPlugin());
kernel.addPlugin(new WebPlugin());
kernel.addPlugin(new TypeORMPlugin());
kernel.addPlugin(new JobPlugin());
kernel.addPlugin(new AppConfigPlugin());
kernel.addPlugin(new TemplatePlugin());
kernel.addPlugin(new FileStoragePlugin());
kernel.addPlugin(new LoggingPlugin());
kernel.addPlugin(new CachePlugin());

kernel.boot(appConfig);

const { container, decorators: { injectable, inject } } = kernel.getContainer();

export {
  container, injectable, inject,
  kernel,
};

