module.exports = function(RED) {
    const nforce = require('./nforce_wrapper');

    function Query(config) {
        RED.nodes.createNode(this, config);
        this.connection = RED.nodes.getNode(config.connection);
        const node = this;
        this.on('input', function(msg) {
            // show initial status of progress
            node.status({ fill: 'green', shape: 'ring', text: 'connecting....' });

            // use msg query if node's query is blank
            var query = '';
            if (msg.hasOwnProperty('query') && config.query === '') {
                query = msg.query;
            } else {
                query = config.query;
            }
            
            // Check if credentials can be used from the msg object
            if (config.allowMsgCredentials && msg.hasOwnProperty("sf")) {
                //TODO: Do we really need to check for empty configuration values
                // or is it OK to overwrite when sf values are present?
                if (msg.sf.consumerKey && this.connection.consumerKey === '') {
                    this.connection.consumerKey = msg.sf.consumerKey;
                }
                if (msg.sf.consumerSecret && this.connection.consumerSecret === '') {
                    this.connection.consumerSecret = msg.sf.consumerSecret;
                }
                if (msg.sf.username && this.connection.username === '') {
                    this.connection.username = msg.sf.username;
                }
                if (msg.sf.password && this.connection.password === '') {
                    this.connection.password = msg.sf.password;
                }

            }


            // create connection object
            const org = nforce.createConnection(this.connection);

            // auth and run query
            org
                .authenticate({ username: this.connection.username, password: this.connection.password })
                .then(function() {
                    return org.search({ search: query });
                })
                .then(function(results) {
                    msg.payload = {
                        size: results.length,
                        records: results
                    };
                    msg.payload = results;
                    node.send(msg);
                    node.status({});
                })
                .error(function(err) {
                    node.status({ fill: 'red', shape: 'dot', text: 'Error:' + err.message + '!' });
                    node.error(err, msg);
                });
        });
    }
    RED.nodes.registerType('sosl', Query);
};
