//a wrapper for redis queue to get messages to publish
var Config = require('../config.js');
var message = require('../classes/message.js');
var logger = require('../helpers/logger.js');
var events = require('events');
var redis = require('redis');
var config = new Config();

var client;
var self;


function Queue() {
    events.EventEmitter.call(this);
    
    self = this;
}

//make it inherit event emitter
Queue.super_ = events.EventEmitter;

Queue.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        value: Queue,
        enumerable: false
    }
});

Queue.prototype.connect = function () {
    client = redis.createClient(config.redis.port, config.redis.host);
    client.on("error", function (err) {
        logger.log("Error " + err, logger.logType.error);
    });
    client.on("ready", function () {
        logger.log('connceted to redis queue :' + config.redis.host + ',' + config.redis.port, logger.logType.debug);
        //start listening
        waitForPush();
    });
    function waitForPush() {
        client.brpop([config.redis.queueName, 0], function (listName, item) {
            // expose message 
            if (item.length && item.length > 1) {
                logger.log("message collected:" + JSON.stringify(item[1]), logger.logType.debug);
                //if (message.topic) {
                self.emit('onMessage', item[1]);
            }
            //block wait
            waitForPush();
        });
    }
};





// export the class
module.exports = Queue;