// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var logger = require('../helpers/logger.js');
var events = require('events');
var Config = require('../config.js');
var extens = require('../helpers/extensions.js');

config = new Config();
var self;
// Constructor
function ServerSocket(port, keepaliveinterval) {
    // always initialize all instance properties
    events.EventEmitter.call(this);
    self = this;
    self.port = port;
    self.connectedSockets = 0;
}
//make it inherit event emitter
ServerSocket.super_ = events.EventEmitter;

ServerSocket.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        value: ServerSocket,
        enumerable: false
    }
});
app.get("/", function (req, res) {
    res.send("Marco Polo is Alive!");
});
// class methods
ServerSocket.prototype.start = function () {
    server.listen(self.port, function () {
        logger.log('Server listening at port '+ self.port, logger.logType.debug);
    });
};

io.on('connection', function (clientSocket) {
    logger.log('Number of connected clients:' + ++self.connectedSockets, logger.logType.debug);
    //keep alive process
    setInterval(function () {
        clientSocket.emit('heartbeat', { 'beat': 1 });
    }, config.server.keepaliveinterval);
    
    // when the client emits 'subscribe', this listens and executes
    clientSocket.on('subscribe', function (data) {
 
        var message = JSON.parse(data);
        clientSocket.ID = message.sessionID;
        // we tell the client to execute 'new message'
        self.emit('subscribe', {
            topics: message.topics,
            sessionID: message.sessionID,
            socket: clientSocket
        });
    });

    // when the client emits 'unsubscribe', this listens and executes
    clientSocket.on('unsubscribe', function (topic) {
        // we tell the client to execute 'new message'
        self.emit('unsubscribe', topic);
    });

    // when the client emits 'disconnects', this listens and executes
    clientSocket.on('disconnect', function () {
        logger.log('Number of connected clients:' + --self.connectedSockets, logger.logType.debug);
        // we tell the client to execute 'new message'
        self.emit('disconnect', clientSocket.ID);
    });
});
function JSONize(str) {
    return str
    // wrap keys without quote with valid double quote
    .replace(/([\$\w]+)\s*:/g, function (_, $1) { return '"' + $1 + '":' })
    // replacing single quote wrapped ones to double quote 
    .replace(/'([^']+)'/g, function (_, $1) { return '"' + $1 + '"' })
}
// export the class
module.exports = ServerSocket;