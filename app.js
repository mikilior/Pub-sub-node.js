var pubsubMediator = require('./pubsubServer/pubsubMediator.js');

var logger = require('./helpers/logger.js');

// catch the uncaught errors that weren't wrapped in a domain or try catch statement
// do not use this in modules, but only in applications, as otherwise we could have multiple of these bound
process.on('uncaughtException', function (err) {
    // handle the error safely
    logger.log(err, logger.logType.error);
})
pubsubMediator = new pubsubMediator();

pubsubMediator.start();