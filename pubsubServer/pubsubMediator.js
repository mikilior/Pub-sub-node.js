var messageQueue = require('../queue/queue.js');
var serverSocket = require('../socket/serverSocket.js');
var Config = require('../config.js');
var logger = require('../helpers/logger.js');
var restClient = require('../rest/restClient');
var q = require('q');
//members
config = new Config();
//restClient = new restClient();
messageQueue = new messageQueue();
//This object will contain all the channels being listened to.
var subscriptions = {};
var topics = {};
serverSocket = new serverSocket(config.server.port);
// Constructor
function PubsubMediator() {

}

// class methods
PubsubMediator.prototype.start = function () {
    //start listening to subscribers
    serverSocket.start();
    serverSocket.on('subscribe', function (user) {
        if (user) {
            // handle notification
            logger.log('subscribed new user:' + user.sessionID + " to topics:" + user.topics, logger.logType.debug);
            //add to list of subscriptions if user has topics to subscribe to
            if (!topics.hasOwnProperty(user.sessionID) && user.topics) {
                subscriptions[user.sessionID] = user;
            }
            else {
                //if user exists- change topics
                if (subscriptions.hasOwnProperty(user.sessionID) && user.topics) {
                    subscriptions[user.sessionID].topics = user.topics;
                }
            }
            
            user.topics.forEach(function (topic) {
                if (user.topics) {
                    if (!topics.hasOwnProperty(topic)) {
                        var arr = new Array();
                        arr.push(user);
                        topics[topic] = arr;
                   //if topic exists- add user
                    } else {
                        topics [topic].push(user);
                    }
                }
            });

        }
    });
    serverSocket.on('unsubscribe', function (sessionID) {
        // handle unsubscribe
        logger.log('unsubscribed  user :' + sessionID, logger.logType.debug);
        //remove from topics array
        removeFromTopics(sessionID);
        //remove to list of subscriptions
        clearUserSubscription(sessionID);
    });
    serverSocket.on('disconnect', function (sessionID) {
        // handle disconnection
        if (sessionID) {
            logger.log('disconnect:' + sessionID, logger.logType.debug);
            //remove from topics array
            removeFromTopics(sessionID);
            //remove from list of subscriptions
            clearUserSubscription(sessionID);
        }
    });
    //start listen to notifications queue
    messageQueue.connect();
    //start handling notification events
    messageQueue.on('onMessage', function (notification) {
        logger.log('onMessage :' + notification, logger.logType.debug);
        // handle notification
        sendMessage(notification);
    });
    function startFailover(notification) {
        logger.log('sending message on failover : ' + notification, logger.logType.debug);
        
        sendMessage(notification).then(function (value) {
            // fulfillment
            logger.log('success on send failover message!' , logger.logType.debug);
        }, function (reason) {
            // on rejection try and send again
            var message = JSON.parse(notification);
            if (message.failovercount <= config.failover.numofretries) {
                logger.log('notification.failovercount-' + message.failovercount + ',config.failover.numofretries-' + config.failover.numofretries, logger.logType.debug);
                message.failovercount++;
                setTimeout(startFailover, config.failover.timebetweenretries * 1000, JSON.stringify(message));
            }
        });
       
    }
    function removeFromTopics(sessionID) {
        if (subscriptions.hasOwnProperty(sessionID)) {
            subscriptions[sessionID].topics.forEach(function (topic) {
                if (topics.hasOwnProperty(topic)) {
                    for (var i = 0; i < topics[topic].length; i++) {
                        var user = topics[topic][i];
                        if (user.sessionID === sessionID)
                            topics[topic].splice(i, 1);
                    }
                }
            });
        }
    }
    function clearUserSubscription(sessionID) {
        if (sessionID && subscriptions.hasOwnProperty(sessionID)) {
            delete subscriptions[sessionID];
                //future TODO- clean BE notifications table to reduce load
                //restClient.unsubscribe(user.sessionID);
        }
    }
    function sendMessage(notification) {
        var deferred = q.defer();
        var message = JSON.parse(notification);
        logger.log('sendMessage :' + notification, logger.logType.debug);
        if (message.topic && topics.hasOwnProperty(message.topic)) {
            //get subscriber
            var subscribers = topics[message.topic];
            subscribers.forEach(function (subscriber) {
                subscriber.socket.send(notification);
                deferred.resolve(message);
            });
        } else {
            logger.log('topic :' + message.topic + ' has no subscribers ', logger.logType.debug);
            if (!message.hasOwnProperty('failovercount')) {
                logger.log('adding message to failover queue :' + message.topic , logger.logType.debug);
                message.failovercount = 1;
                startFailover(JSON.stringify(message));
                deferred.reject('failovercount');
            }
            deferred.reject('nosubscribers');
        }
        return deferred.promise;  
    }
};








// export the class
module.exports = PubsubMediator;