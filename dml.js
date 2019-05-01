module.exports = function(RED) {
  const nforce = require('./nforce_wrapper');

  function Dml(config) {
    RED.nodes.createNode(this, config);
    this.connection = RED.nodes.getNode(config.connection);
    const node = this;
    this.on('input', (msg) => {
      // show initial status of progress
      node.status({ fill: 'green', shape: 'ring', text: 'connecting....' });

      // check for overriding message properties
      const theAction = msg.hasOwnProperty('action') && config.action === '' ? msg.action : config.action;
      const theObject = msg.hasOwnPropety('object') && config.object === '' ? msg.object : config.object;

      // create connection object
      const orgResult = nforce.createConnection(this.connection);
      const sobj = nforce.force.createSObject(theObject, msg.payload);
      const payload = { sobject: sobj };
      nforce.extractHeaders(payload, msg);

      // Auth and run DML
      nforce
        .authenticate(orgResult.connection, orgResult.config)
        .then((oauth) => {
          let dmlResult;
          const org = orgResult.org;
          switch (theAction) {
            case 'insert':
              dmlResult = org.insert(payload);
              break;
            case 'update':
              dmlResult = org.update(payload);
              break;
            case 'upsert':
              if (msg.hasOwnProperty('externalId')) {
                sobj.sobject.setExternalId(msg.externalId.field, msg.externalId.value);
              }
              dmlResult = org.upsert(payload);
              break;
            case 'delete':
              dmlResult = org.delete(payload);
              break;
            default:
              const err = new Error('Unknown method:' + theAction);
              nforce.error(node, msg, err);
          }

          return dmlResult;
        })
        .then((results) => {
          msg.payload = {
            success: true,
            object: theObject.toLowerCase(),
            action: theAction,
            id: results.id ? results.id : msg.externalId ? msg.externalId : msg.payload.id
          };

          node.send(msg);
          node.status({});
        })
        .catch((err) => nforce.error(node, msg, err));
    });
  }
  RED.nodes.registerType('dml', Dml);
};
