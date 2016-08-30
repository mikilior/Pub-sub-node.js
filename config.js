var config = {};


config.redis = {};
config.server = {};
config.log = {};

module.exports = function () {
    switch (process.env.NODE_ENV) {
        case 'development':
            return {
                redis: {
                    host: '127.0.0.1',
                    port : 6379,
                    queueName: 'redistest'
                },
                server: {
                    port: 5000,
                    keepaliveinterval: 15000

                },
                //add types console, file , logstash to activate the log configs
                log: {
                    type: ['console', 'file']
                },
                //resend messages on startup
                failover: {
                    numofretries: 3,
                    timebetweenretries: 5
                }
            }


        case 'qa':
            return {
                redis: {
                    host: '127.0.0.1',
                    port : 6379,
                    queueName: 'redistest'
                },
                server: {
                    port: 5555,
                    keepaliveinterval: 15000

                },
                //add types console, file , logstash to activate the log configs
                log: {
                    type: ['console', 'file']
                },
                //resend messages on startup
                failover: {
                    numofretries: 3,
                    timebetweenretries: 5
                }
            }

        default:
            return {
                redis: {
                    host: '127.0.0.1',
                    port : 6379,
                    queueName: 'redistest'
                },
                server: {
                    port: 5555,
                    keepaliveinterval: 15000

                },
                //add types console, file , logstash to activate the log configs
                log: {
                    type: ['console', 'file']
                },
                //resend messages on startup
                failover: {
                    numofretries: 3,
                    timebetweenretries: 5
                }
            }
    }
};


