const nforce = require('nforce');

module.exports = {
    createConnection: function(configOptions, msg) {
        msg = msg || {};
        const orgOptions = {
            mode: 'single',
            redirectUri: configOptions.callbackUrl,
            environment: configOptions.environment
        };

        // Overwrite credentials from msg
        const useMsgCred = configOptions.allowMsgCredentials && msg.hasOwnProperty('sf');
        orgOptions.clientId = (useMsgCred && msg.sf.consumerKey) ? msg.sf.consumerKey : configOptions.consumerKey;
        orgOptions.clientSecret = (useMsgCred && msg.sf.consumerSecret) ? msg.sf.consumerSecret : configOptions.consumerSecret;

        // Overwrite the endpoints eventually - access instance directly
        if (configOptions.usePotUrl) {
            orgOptions.authEndpoint = configOptions.poturl;
            orgOptions.testAuthEndpoint = configOptions.poturl;
        }

        return nforce.createConnection(orgOptions);
    },

    // wrapper around the org.authenticate function
    authenticate: function(org, configOptions, msg, callback) {
        const useMsgCred = configOptions.allowMsgCredentials && msg.hasOwnProperty('sf');
        const authOptions = {};
        authOptions.username = (useMsgCred && msg.sf.username) ? msg.sf.username : configOptions.username;
        authOptions.password = (useMsgCred && msg.sf.password) ? msg.sf.password : configOptions.password;

        org.authenticate(authOptions, callback);
    }
};