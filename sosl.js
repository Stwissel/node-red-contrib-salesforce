module.exports = function (RED) {
    const nforce = require('./nforce_wrapper');

    function SoslQuery(config) {
        RED.nodes.createNode(this, config);
        this.connection = RED.nodes.getNode(config.connection);
        const node = this;
        this.on('input', function (msg) {
            // show initial status of progress
            node.status({ fill: 'green', shape: 'ring', text: 'connecting....' });

            // use msg query if node's query is blank
            const query = (msg.hasOwnProperty('query') && config.query === '')
                ? msg.query
                : config.query;
            const payload = { search: query };

            // create connection object
            const orgResult = nforce.createConnection(this.connection);
            const org = orgResult.connection;


            // auth and run query
            nforce
                .authenticate(org, orgResult.config)
                .then(oath => {
                    return org.search(payload);
                })
                .then(results => {
                    msg.payload = results.map(r => r.toJSON());
                    node.send(msg);
                    node.status({});
                })
                .catch(err => nforce.error(node, msg, err));
        });
    }
    RED.nodes.registerType('sosl', SoslQuery);
};
