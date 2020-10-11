const uuid = require('uuid');
const os   = require('os');

class CustomMetric {

  constructor(sensorConfig, metricConfig) {
    this.sensorConfig = Object.assign({
      name: os.hostname()
    }, sensorConfig);

    this.metricConfig = Object.assign({
      uid: uuid.v4(),
      name: 'Custom',
      tags: '',
      rendererName: 'Table',
      refreshInterval: 5000
    }, metricConfig);
  }

  getInfo() {
    const _this = this;
    return new Promise(function(resolve) {
      resolve({
        metricUid: _this.metricConfig.uid,
        metricName: _this.metricConfig.name,
        metricTags: _this.metricConfig.tags,
        metricRenderer: _this.metricConfig.rendererName,
        metricRefreshInterval: _this.metricConfig.refreshInterval,
      });
    });
  }

  getConfig() {
    return new Promise(function(resolve) {
      resolve({});
    });
  }

  getData() {
    return new Promise(function(resolve) {
      resolve({});
    });
  }

}

module.exports = CustomMetric;
