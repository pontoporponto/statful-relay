var EnvProcessor = function (config, processor) {

    this.execute = function (metric) {
        processor.execute(environmentPresent(metric) ? metric : addEnvironment(metric, config.environment));
    };
};

function environmentPresent (metric) {
    let metricContent = processRawMetric(metric);
    
    for(var i = 0; i < metricContent['tags'].length; i++) {
        if(metricContent['tags'][i]['name'] === 'environment') {
            return true;
        }
    }

    return false;
}

function addEnvironment (baseRawMetric, env) {
    let metricContent = processRawMetric(baseRawMetric);
    var newMetric = "";

    metricContent['tags'].push({name: 'environment', value: env});

    newMetric += metricContent['name'];

    for(var i = 0; i < metricContent['tags'].length; i++) {
        newMetric += "," + metricContent['tags'][i]['name'] + "=" + metricContent['tags'][i]['value'];
    }

    newMetric += " " + metricContent['values'];

    console.log("Config2 " + newMetric);

    return newMetric;
}

function processRawMetric (metric) {
    var structure = {};
    var content = metric.slice(0, metric.indexOf(' ')).split(',');

    structure['name'] = content[0];
    structure['values'] = metric.slice(metric.indexOf(' ') + 1, metric.length);
    structure['tags'] = [];
    
    for(var i = 1; i < content.length; i++) {
        structure['tags'].push(splitTagValue(content[i]));
    }

    return structure;
}

function splitTagValue (rawTag) {
    return {name: rawTag.slice(0, rawTag.indexOf('=')), value: rawTag.slice(rawTag.indexOf('=') +1, rawTag.length)};
}

module.exports = EnvProcessor;