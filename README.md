# Pub-sub-node.js
A simple and generic pub sub server using socket.io and based on node.js

#Interfaces :
# queue of notifications- currently using redis queue.
1. listen to a queue that its location  i specified in the config file config.redis.host (IP for redis) , config.redis.port ( port for redis) , and the queue name that its listening to - config.redis.queueName. notification server needs to send its notifications to the same redis and to the same queue that marco polo is listening to.
2. notification needs to be in the json format  and holds sessionID , topic ( same as the subscriber is listed to ) e.g. {"topic":"reports",...}  and rest of fields that client needs. (recomended - put another json on data field so all notifications will ne generic to client)

# interface to client:
used socket.io to listen to incoming connections from client. why? becuase it's great. Mainly in it's fall backs to long-polling when web socket is not supported.

# functionality
1. connect- need to elaborate?
2. subscribe- adds user to a subscribers on marco polo with topics listed. if user exits and subscribed- it will replace the topics he is listed on. json format : {'sessionID':'1','topics': ['messages','dashboard']}
3. unsubscribe- remove user from subscibers list- use on logout on client side.
if browser is forced to shut down a disconnet event should act on marco polo and remove the user from subscribers list.

# extra
1. hearbeat event that is an aplicative keep alive to prevent firewall to close open web socket. marco polo is creating this hearthbeat every 15 seconds be default or configured by config.server.keepaliveinterval config.
2. logging - supported by config file . Can write to console , file and hopefully logstash.
3. enviroment vars - in order to load config per enviroment run node with  NODE_ENV=development ( qa, production).
