var Enum = require('enum');
var log4js = require('log4js');
var Config = require('../config.js');
config = new Config();
var LOGTYPE = new Enum(['trace', 'debug', 'info', 'warn', 'error']);
//define console logger
if (config.log.type.indexOf('console') < 0) {
    log4js.clearAppenders();
}
//define file logger
if (config.log.type.indexOf('file') >-1){
    log4js.loadAppender('file');
    log4js.addAppender(log4js.appenders.file('marcoPolo.log'), 'marcopolo');
}
//define logstash logger
if (config.log.type.indexOf('logstash') > -1) {
    log4js.configure({
        "appenders": [
            {
                "category": "marcopolo",
                "type": "log4js-logstash",
                "host": "localhost",
                "port": 5959,
                "fields": {
                    "source": "marcoPolo"
                }
            }
        ]
    });
}

var logger = log4js.getLogger('marcopolo');

module.exports.logType = LOGTYPE; 

module.exports.log = function (msg,logType) {
    switch (logType) {
        case LOGTYPE.trace:
            logger.trace(msg);
            break;
        case LOGTYPE.debug:
            logger.debug(msg);
            break;
        case LOGTYPE.trace:
            logger.trace(msg);
            break;
        case LOGTYPE.info:
            logger.info(msg);
            break;
        case LOGTYPE.warn:
            logger.warn(msg);
            break;
        case LOGTYPE.error:
            logger.error(msg);
            break;
        default:
            logger.error(msg);
            break;
    }
}