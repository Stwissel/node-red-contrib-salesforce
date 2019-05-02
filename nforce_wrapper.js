const nforce8 = require('nforce8');

const createConnection = function(configOptionsRaw, msg) {
  // Update configOptions from msg if there's incoming credentials
  const configOptions = getConfig(configOptionsRaw, msg);
  msg = msg || {};
  const orgOptions = {
    /* TODO: remove single option to facilitate alternative logins */
    mode: 'single',
    redirectUri: configOptions.callbackUrl,
    environment: configOptions.environment
  };

  // Overwrite the endpoints eventually - access instance directly
  if (configOptions.usePotUrl) {
    orgOptions.authEndpoint = configOptions.poturl;
    orgOptions.testAuthEndpoint = configOptions.poturl;
  }

  if (configOptions.apiversion) {
    orgOptions.apiVersion = configOptions.apiversion;
  }
  orgOptions.clientId = configOptions.consumerKey;
  const connectionResult = nforce8.createConnection(orgOptions);
  connectionResult.clientSecret = configOptions.consumerSecret;
  const result = {
    connection: connectionResult,
    config: configOptions
  };
  //console.log( 'Connection: ' + JSON.stringify(result.connection,null,2) );
  //console.log( 'Config: ' + JSON.stringify(result.config,null,2) );


  return result;
};

// wrapper around the org.authenticate function
// TODO: Token authentication for Salesforce roundtrip
const authenticate = function(org, configOptions) {
  // TODO: Check if we have a incomign session
  //console.log( 'Org: ' + org );
  return org.authenticate(configOptions);
};

/**
 * Define
 * @param {*} configOptions the current configuration settings
 * @param {*} msg the actual incoming message that might contain identity information
 */
const getConfig = function(configOptions, msg) {
  //console.log( 'ConfigOptions: ' + JSON.stringify(configOptions) );
  //console.log( 'Msg: ' + msg );
  configOptions = configOptions || {};
  const connectionOptionResult = Object.assign({}, configOptions);
  //  Check if  credentials from message overwrite credentials from config
  if (configOptions.allowMsgCredentials && msg.hasOwnProperty('sf')) {
    //TODO: Do we really need to check for empty configuration values
    // or is it OK to overwrite when sf values are present?
    if (msg.sf.consumerKey && this.connection.consumerKey === '') {
      connectionOptionResult.consumerKey = msg.sf.consumerKey;
    }
    if (msg.sf.consumerSecret && this.connection.consumerSecret === '') {
      connectionOptionResult.consumerSecret = msg.sf.consumerSecret;
    }
    if (msg.sf.username && this.connection.username === '') {
      connectionOptionResult.username = msg.sf.username;
    }
    if (msg.sf.password && this.connection.password === '') {
      connectionOptionResult.password = msg.sf.password;
    }
  }

  //console.log('consumerKey: ' + connectionOptionResult.consumerKey);
  //console.log('consumerSecret: ' + connectionOptionResult.consumerSecret);
  return connectionOptionResult;
};

const redError = function(redNode, msg, err) {
  redNode.status({ fill: 'red', shape: 'dot', text: 'Error:' + err.message });
  redNode.error(err, msg);
};

/**
 * Checks for Salesforce headers in msg object to send back to SF
 * @param {*} payload - the data to be posted
 * @param {*} msg - the incoming message
 */
const extractHeaders = function(payload, msg) {
  if (payload && msg && msg.sf && msg.sf.headers) {
    payload.headers = msg.sf.headers;
  }
};

module.exports = {
  createConnection: createConnection,
  authenticate: authenticate,
  force: nforce8,
  error: redError,
  extractHeaders: extractHeaders
};
