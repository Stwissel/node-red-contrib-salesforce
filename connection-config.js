module.exports = function(RED) {
    function ConnectionConfig(n) {
        RED.nodes.createNode(this, n);
        this.consumerKey = n.consumerKey;
        this.consumerSecret = n.consumerSecret;
        this.callbackUrl = n.callbackUrl;
        if (n.environment.substr(0, 6) === 'custom') {
            //nforce only needs production/sandbox
            this.environment = n.environment.substr(6);
            this.poturl = n.poturl;
            this.usePotUrl = true;
        } else {
            this.environment = n.environment;
        }
        this.allowMsgCredentials = n.allowMsgCredentials;
        this.username = n.username;
        this.password = n.password;
        // Optional reading of username/password from environment
        if (n.useEnvCredentials) {
            const envUser = n.name + '_UserName';
            const envPassword = n.name + '_PassWord';
            this.username = process.env[envUser];
            this.password = process.env[envPassword];
            // Also consumer secret and consumer key - if they exist
            const envKeyName = n.name + '_ConsumerKey';
            const envSecretName = n.name + '_ConsumerSecret';
            const keyCandidate = process.env[envKeyName];
            const secretCandidate = process.env[envSecretName];
            if (keyCandidate) {
                this.consumerKey = keyCandidate;
            }
            if (secretCandidate) {
                this.consumerSecret = secretCandidate;
            }
        }
    }
    RED.nodes.registerType('connection-config', ConnectionConfig);
};