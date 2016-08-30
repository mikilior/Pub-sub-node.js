var Client = require('node-rest-client-alt').Client;

var logger = require('../helpers/logger.js');

var client = new Client();

// Constructor
function restClient(topic, body) {
    // always initialize all instance properties
    this.topic = topic;
    this.messageBody = body;
}
// class methods
restClient.prototype.unsubscribe = function (sessionID) {
    // set content-type header and data as json in args parameter
    var args = {
        headers: { "X-Laas-Session-Token": sessionID }
    };

    client.delete("https://localhost/notification-subscribe/" + sessionID, args, function (data, response) {
      
    logger.log(sessionID + ' rest unsubscribe due to disconnection' + data);
    });
};
// export the class
module.exports = restClient;