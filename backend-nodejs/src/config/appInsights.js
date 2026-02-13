const appInsights = require("applicationinsights");

appInsights.setup(process.env.APPINSIGHTS_CONNECTION_STRING)
  .start();

module.exports = appInsights.defaultClient;
