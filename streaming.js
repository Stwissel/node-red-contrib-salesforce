module.exports = function(RED) {
    const nforce = require('./nforce_wrapper');
    //array to back-up the node - to disconnect the streaming client when redeploying flow
    const clients = {};
    function Streaming(config) {
        const node = this;
        RED.nodes.createNode(node, config);
        node.connection = RED.nodes.getNode(config.connection);
        node.subscriptionActive = false;
        node.client = {}; // The client

        // back-up the node and disconnect/clean-up when redeploying flow to avoid duplicated subscription 
        if(!clients[node.id]){
            clients[node.id] = node;
        }else{
            if(clients[node.id].client.disconnect){
                clients[node.id].client.disconnect();
                clients[node.id] = node;
            }
        }
        
        node.status({ fill: 'gray', shape: 'ring', text: 'idle' });

        this.on('input', function(msg) {
            const action = msg.action || 'subscribe';
            if(!node.subscriptionActive){
                if (action === 'subscribe') {
                    // create connection object
                    node.status({ fill: 'blue', shape: 'ring', text: 'connecting....' });
                    debugger;
                    const org = nforce.createConnection(node.connection, msg);
                    nforce.authenticate(org, node.connection, msg, function(err, oauth) {
                        let lastReplayId = -1;
                        if (err) {
                            node.status({ fill: 'red', shape: 'dot', text: 'Error:' + err.message });
                            return node.error(err, err.message);
                        }
                        const opts = {};
                        const topicType = msg.topicType || config.topicType;
                        if (topicType === 'platform') {
                            opts.isEvent = true;
                        } else if (topicType === 'generic') {
                            opts.isSystem = true;
                        }
                        // Topic in message takes priority over configuration
                        opts.topic = msg.topic || config.pushTopic;
                        const subscriptionMessage = 'Subscription on ' + topicType + ' to:' + opts.topic;
    
                        var stream;
                        try {
                            node.client = org.createStreamClient();
                            stream = node.client.subscribe(opts);
                            node.log(subscriptionMessage);
                            node.status({ fill: 'blue', shape: 'dot', text: subscriptionMessage });
                            node.subscriptionActive = true;
                            stream.on('error', function(err) {
                                node.log('Subscription error!!!');
                                node.status({ fill: 'red', shape: 'dot', text: 'Error:' + err.message });
                                node.log(err, msg);
                                node.client.disconnect();
                                node.subscriptionActive = false;
                                return node.error(err, err.message);
                            });
                        } catch (ex) {
                            node.status({ fill: 'red', shape: 'dot', text: 'Error:' + ex.message });
                            return node.error(ex, ex.message);
                        }
    
                        stream.on('data', function(data) {
                            
                            if(lastReplayId == data.event.replayId){
                                return;
                            }
    
                            lastReplayId = data.event.replayId;
                            
                            node.status({ fill: 'green', shape: 'dot', text: 'Receiving data' });
                            node.send({
                                payload: data
                            });
                            node.status({ fill: 'blue', shape: 'dot', text: subscriptionMessage });
                        });
                    });
                }

            } else {
                // Unsubscribe only for active subscriptions
                if (node.client.disconnect) {
                    node.client.disconnect();
                    node.status({ fill: 'gray', shape: 'ring', text: 'idle' });
                    node.subscriptionActive = false;
                }
            }
        });
    }

    RED.nodes.registerType('streaming', Streaming);
};
