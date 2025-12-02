export const appConfig = {
  appName: process.env.APP_NAME,
  apiBaseUrl: process.env.API_BASE_URL,
  appUniqueSlug: process.env.APP_UNIQUE_SLUG,
  gcLicenseKey: process.env.GC_LICENSE_KEY,
  mixPanelProjectToken: process.env.MIX_PANEL_PROJECT_TOKEN,
  clikGateway: {
    baseUrl: process.env.CG_BASE_URL,
    manageUsersUrl: process.env.CG_MANAGE_USERS_URL,
  },
  agGridLicense: process.env.AG_GRID_LICENSE,
};
