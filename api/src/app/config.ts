import * as def from 'dotenv-flow';
import * as winston from 'winston';

def.config({
  purge_dotenv: true,
});

const config = {
  app: {
    uniqueSlug: process.env.APP_UNIQUE_SLUG,
    ui_app: {
      base_url: process.env.UI_APP_BASE_URL,
    },

    emailIds: {
      raiseTicket: process.env.RAISE_TICKET_EMAIL_ID.replace(' ', '').split(','),
      accountUpdates: process.env.ACCOUNT_UPDATES_EMAIL_IDS.replace(' ', ',').split(','),
    },

    trainn: {
      apiKey: process.env.TRAINN_API_KEY,
      workspaceName: process.env.TRAINN_WORKSPACE_NAME,
    },

    stripe: {
      key: process.env.STRIPE_KEY,
      originAppName: 'invest-assist',
      productId: process.env.STRIPE_INA_PRODUCT_ID,
      plan1: process.env.STRIPE_INA_PLAN1_ID,
      plan2: process.env.STRIPE_INA_PLAN2_ID,
      webhookSecret: process.env.STRIPE_WENHOOK_SECRET,
    },

    clikGateway: {
      apiBaseUrl: process.env.CLIK_GATEWAY_API_URL,
      appBaseUrl: process.env.CLIK_GATEWAY_APP_URL,
      getAuthUrlApi: 'api/sso/client/getAuthUrl',
      getAdminAuthUrlApi: 'api/_admin/sso/client/getAuthUrl',
      validateTokenApi: 'api/sso/client/validateToken',
      validateAdminTokenApi: 'api/_admin/sso/client/validateToken',
      getAccountApi: 'api/client/account',
      getAccountUserApi: 'api/client/accountUser',
      getAccountUsersApi: 'api/client/accountUsers',
      getAddAccountUrlApi: 'api/_admin/sso/client/getAddAccountUrl',
      key: process.env.CLIK_GATEWAY_KEY,
      secret: process.env.CLIK_GATEWAY_SECRET,
    },

    ml: {
      apiSlug: process.env.ML_API_SLUG,
      extractApi: process.env.ML_EXTRACT_API,
    },
    google: {
      placesApiKey: process.env.GOOGLE_PLACES_API_KEY,
    },

    modelIntegration: {
      plan1ModelFile: 'src/app/files/Clik_Model_Basic.xlsm',
      plan2ModelFile: 'src/app/files/Clik_Model.xlsm',
      plan1LiteModelFile: 'src/app/files/Clik_Model_Basic_Lite.xlsm',
      plan2LiteModelFile: 'src/app/files/Clik_Model_Lite.xlsm',
      sampleStaticModelFile: 'src/app/files/SampleDealStaticModel.xlsx',
    },
  },

  logging: {
    transports: {
      file: {
        factory: 'logging.transport.factory.file',
        options: {
          filename: 'logs.log',
          dirname: 'logs',
        },
      },
      console: {
        factory: 'logging.transport.factory.console',
        options: {},
      },
    },
    loggers: {
      default: {
        level: 'debug',
        getFormat: () => winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
        transports: ['file', 'console'],
      },
    },
  },

  web: {
    server: {
      port: process.env.WEB_SERVER_PORT,
    },
    bodyParser: {
      json: {
        limit: '100mb',
        excludeBasePaths: ['/webhooks/stripe'],
      },
      urlencoded: {
        extended: false,
      },
    },
  },

  security: {
    firewalls: {
      superAdminJwt: {
        factory: 'security.auth.JwtAuthStrategyFactory',
        userProvider: 'app.service.SuperAdminService',
        options: {
          jwt: {
            issuer: process.env.SECURITY_DEFAULT_JWT_ISSUER,
            secret: process.env.SECURITY_DEFAULT_JWT_SECRET,
            expiresIn: process.env.SECURITY_DEFAULT_JWT_EXPIRY,
          },
        },
      },
      superAdminLocal: {
        factory: 'security.auth.LocalAuthStrategyFactory',
        userProvider: 'app.service.SuperAdminService',
      },
      accountUserJwt: {
        factory: 'security.auth.JwtAuthStrategyFactory',
        userProvider: 'app.service.accountUserManager',
        options: {
          jwt: {
            issuer: process.env.SECURITY_DEFAULT_JWT_ISSUER,
            secret: process.env.SECURITY_DEFAULT_JWT_SECRET,
            expiresIn: process.env.SECURITY_DEFAULT_JWT_EXPIRY,
          },
        },
      },
      cgAccountUserBasic: {
        factory: 'app.security.auth.CGBasicAuthStrategyFactory',
      },
      accountUserJwtQuery: {
        factory: 'security.auth.JwtAuthStrategyFactory',
        userProvider: 'app.service.accountUserManager',
        options: {
          jwt: {
            issuer: process.env.SECURITY_DEFAULT_JWT_ISSUER,
            secret: process.env.SECURITY_DEFAULT_JWT_SECRET,
            expiresIn: process.env.SECURITY_DEFAULT_JWT_EXPIRY,
          },
          request: {
            extractJwt: 'fromUrlQueryParameter',
            extractJwtParams: ['Authorization'],
          },
        },
      },
    },
  },

  typeorm: {
    connections: [{
      name: 'default',
      type: 'mysql',
      host: process.env.TYPEORM_DB_HOST,
      port: process.env.TYPEORM_DB_PORT,
      username: process.env.TYPEORM_DB_USER,
      password: process.env.TYPEORM_DB_PASSWORD,
      database: process.env.TYPEORM_DB_DATABASE,
      synchronize: false,
      logging: false,
      entities: [process.env.TYPEORM_DB_ENTITIES_PATH],
      migrations: [process.env.TYPEORM_DB_MIGRATIONS_PATH],
      subscribers: [process.env.TYPEORM_DB_SUBSCRIBERS_PATH],
      cli: {
        entitiesDir: 'src/app/db/entity',
        migrationsDir: 'src/app/db/migration',
        subscribersDir: 'src/app/db/subscriber',
      },
    }],
  },

  jobs: {
    defaultEngine: `jobs.engine.${process.env.JOBS_DEFAULT_ENGINE}`,
    handlers: {
      'mail': ['job.mail.handler'],
      'extract.document': ['job.extract.document.handler'],
      'mail.document.uploaded': ['job.mail.document.uploaded.handler'],
    },
    bull: {
      redis: {
        host: process.env.JOBS_REDIS_HOST,
        port: process.env.JOBS_REDIS_PORT,
      },
      queue: {
        name: process.env.JOBS_QUEUE_NAME,
      },
    },
  },

  mailer: {
    defaultTransport: process.env.MAILER_DEFAULT_TRANSPORT,
    defaultSender: process.env.MAILER_DEFAULT_SENDER,
    transports: {
      stream: {
        newline: 'unix',
      },
      json: {
        skipEncoding: true,
      },
      mailgun: {
        auth: {
          api_key: process.env.MAILER_MAILGUN_KEY,
          domain: process.env.MAILER_MAILGUN_DOMAIN,
        },
        proxy: false,
      },
    },
  },

  template: {
    defaultEngine: 'template.engine.nunjucks',
    nunjucks: {
      templatesPath: 'src/app/views',
    },
  },

  fileStorage: {
    storages: {
      dealDocuments: {
        storage: process.env.DEAL_DOC_STORAGE,
        options: {
          region: process.env.DEAL_DOC_AWS_REGION,
          defaultBucket: process.env.DEAL_DOC_AWS_S3_DEFAULT_BUCKET,
          accessKeyId: process.env.DEAL_DOC_AWS_ACCESS_KEY,
          secretAccessKey: process.env.DEAL_DOC_AWS_SECRET_KEY,
        },
      },
    },
  },
};

export default config;

export type AppConfigType = typeof config['app'];
