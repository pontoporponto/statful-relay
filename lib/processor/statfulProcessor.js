var Statful = require('statful-client');

var StatfulProcessor = function (config) {
    var statful = new Statful(config);

    this.execute = function (metric) {
        statful.putRaw(metric);
    };
};

module.exports = StatfulProcessor;