module.exports = function (RED) {

    const nforce = require('./nforce_wrapper');

    function Chatter(config) {
        const node = this;
        RED.nodes.createNode(this, config);
        this.connection = RED.nodes.getNode(config.connection);

        this.on('input', msg => {

            // show initial status of progress
            node.status({ fill: "green", shape: "ring", text: "connecting...." });

            const payload = nforce.force.createSObject('FeedItem');
            payload.Body = msg.payload

            // Additional fields for addressing the chatter post properly
            if (msg.ParentId) {
                payload.ParentId = msg.ParentId;
            }

            if (msg.RelatedRecordId) {
                payload.RelatedRecordId = msg.RelatedRecordId;
            }

            if (msg.Title) {
                payload.Title = msg.Title;
            }

            // create connection object
            const orgResult = nforce.createConnection(this.connection);

            // auth and insert Feed Item
            nforce
                .authenticate(orgResult.connection, orgResult.config)
                .then(result => {
                    const sobj = { sobject: payload };
                    return orgResult.connection.insert(sobj)
                        .catch(err => {
                            node.status({ fill: 'red', shape: 'dot', text: 'Error:' + e.message });
                            node.error(err, msg);
                        });
                })
                .then(results => {
                    msg.payload = results.records.map(record => record.toJSON());
                    node.send(msg);
                    node.status({});
                })
                .catch(function (err) {
                    node.status({ fill: 'red', shape: 'dot', text: 'Error:' + e.message });
                    node.error(err, msg);
                });
        });
    }
    RED.nodes.registerType("chatter", Chatter);
};
