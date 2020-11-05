var UDP = require('../transport/udp');
var StatfulProcessor = require('../processor/statfulProcessor');
var EnvProcessor = require('../processor/envProcessor');
var Logger = require('../logger');
var Utils = require('../utils');

/**
 * Builds up a function to dispatch incoming metrics
 *
 * @returns {Function}
 */
function dispatchMetricLine (listener) {
    return function (lines) {
        lines = lines.toString();

        if (lines && typeof lines === 'string') {
            var linesList = lines.split('\n');
            linesList.forEach(function (metricLine) {
                listener.logger.debug('Raw metric received: ' + metricLine);

                listener.processMetric(metricLine);
            });

            if (listener.config.stats) {
                listener.statfulClient.counter('metrics_flushed', linesList.length);
            }
        }
    };
}

/**
 * Constructor for the Relay Statful Listener.
 *
 * @param config A configuration object of the listener
 * @constructor
 */
var StatfulListener = function (config) {
    this.config = config;
    this.udpTransport = null;
    this.logger = Logger.sharedLogger().child({ file: Utils.getCurrentFile(module) }, true);
};

/**
 * Starts the Statful Listener
 */
StatfulListener.prototype.start = function () {
    var udpConfig = {
        port: this.config.listeners.statful.port,
        address: this.config.listeners.statful.address,
        ipv6: this.config.listeners.statful.ipv6
    };
    this.logger.info('Listener for statful metrics will start.');
    this.udpTransport = new UDP(udpConfig, dispatchMetricLine(this));
    this.udpTransport.start();
};

/**
 * Stops the Statful Listener
 */
StatfulListener.prototype.stop = function () {
    this.udpTransport.stop();
    this.logger.info('Listener for statful metrics has been stopped.');
};

StatfulListener.prototype.processMetric = function (rawMetric) {
    var processor = new EnvProcessor(this.config.statfulClient, new StatfulProcessor(this.config.statfulClient));

    processor.execute(rawMetric);
};

module.exports = StatfulListener;
