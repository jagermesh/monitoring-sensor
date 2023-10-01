const uuid = require('uuid');
const os = require('os');

class CustomMetric {
  constructor(sensorConfig, metricConfig) {
    this.sensorConfig = Object.assign({
      name: os.hostname(),
    },
    sensorConfig,
    );

    this.metricConfig = Object.assign({
      uid: uuid.v4(),
      name: 'Custom',
      tags: '',
      rendererName: 'Table',
      refreshInterval: 5000,
    },
    metricConfig,
    );
  }

  getInfo() {
    return new Promise((resolve) => {
      resolve({
        metricUid: this.metricConfig.uid,
        metricName: this.metricConfig.name,
        metricTags: this.metricConfig.tags,
        metricRenderer: this.metricConfig.rendererName,
        metricRefreshInterval: this.metricConfig.refreshInterval,
      });
    });
  }

  getConfig() {
    return new Promise((resolve) => {
      resolve({});
    });
  }

  getData() {
    return new Promise((resolve) => {
      resolve({});
    });
  }
}

module.exports = CustomMetric;
