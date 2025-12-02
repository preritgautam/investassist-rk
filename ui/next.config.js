require('dotenv-flow').config({
  purge_dotenv: true,
});

module.exports = {
  env: {
    APP_NAME: process.env.APP_NAME,
    API_BASE_URL: process.env.API_BASE_URL,
    APP_UNIQUE_SLUG: process.env.APP_UNIQUE_SLUG,
    GC_LICENSE_KEY: process.env.GC_LICENSE_KEY,
    MIX_PANEL_PROJECT_TOKEN: process.env.MIX_PANEL_PROJECT_TOKEN,
    LOAD_COMMANDBAR: process.env.LOAD_COMMANDBAR,
    COMMANDBAR_ORG_ID: process.env.COMMANDBAR_ORG_ID,
    CG_BASE_URL: process.env.CG_BASE_URL,
    CG_MANAGE_USERS_URL: process.env.CG_MANAGE_USERS_URL,
    AG_GRID_LICENSE: process.env.AG_GRID_LICENSE,
  },
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};
