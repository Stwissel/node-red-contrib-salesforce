module.exports = function (RED) {
    const nforce = require('./nforce_wrapper');

    function SoqlQuery(config) {
        const node = this;
        RED.nodes.createNode(node, config);
        this.connection = RED.nodes.getNode(config.connection);

        this.on('input', function (msg) {
            // show initial status of progress
            node.status({ fill: 'green', shape: 'ring', text: 'connecting....' });

            // use msg query if node's query is blank
            // TODO: should the msg.query ALWAYS overwrite the config query of existent?
            const query = (msg.hasOwnProperty('query') && config.query === '')
                ? msg.query
                : config.query;
            const payload = { fetchAll: config.fetchAll, query: query };

            // create connection object
            const orgResult = nforce.createConnection(this.connection);
            const org = orgResult.connection;
            // auth and run query
            nforce
                .authenticate(org, orgResult.config)
                .then(oath => {
                    return org.query(payload)
                        .catch(err => nforce.error(node, msg, err));
                })
                .then(results => {
                    msg.payload = results.records.map(r => r.toJSON());
                    node.send(msg);
                    node.status({});
                })
                .catch(err => nforce.error(node, msg, err));
        });
    }
    RED.nodes.registerType('soql', SoqlQuery);
};
