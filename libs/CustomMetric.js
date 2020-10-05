const uuid = require('uuid');
const os   = require('os');

class CustomMetric {

  constructor(sensorConfig, metricConfig) {
    this.sensorConfig = Object.assign({ }, sensorConfig);
    this.metricConfig = Object.assign({ }, metricConfig);

    this.metricUid       = uuid.v4();
    this.metricName      = metricConfig.name;
    this.metricTags      = (metricConfig.tags || '').split(',');
    this.sensorName      = sensorConfig.name || os.hostname();
    this.rendererName    = metricConfig.rendererName;
    this.refreshInterval = metricConfig.refreshInterval;
  }

  getInfo() {
    const _this = this;
    return new Promise(function(resolve, reject) {
      resolve({
          metricUid: _this.metricUid
        , metricName: _this.metricName
        , metricTags: _this.metricTags
        , metricRenderer: _this.rendererName
        , metricRefreshInterval: _this.refreshInterval
      });
    });
  }

  getConfig() {
    return new Promise(function(resolve, reject) {
      resolve({});
    });
  }

  getData() {
    return new Promise(function(resolve, reject) {
      resolve({});
    });
  }

}

module.exports = CustomMetric;
