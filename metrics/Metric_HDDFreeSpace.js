const childProcess = require('child_process');
const uid = require('uuid');

module.exports.create = function(sensorConfig, metricConfig) {

  const _this = this;

  _this.sensorConfig = Object.assign({ }, sensorConfig);
  _this.metricConfig = Object.assign({ refreshInterval: 30000, rendererName: 'Chart' }, metricConfig);
  _this.metricConfig.settings = Object.assign({ }, _this.metricConfig.settings);

  _this.uid = uid.v4();

  _this.init = function () {

  };

  _this.getUid = function () {
    return _this.uid;
  };

  _this.getRendererName = function() {
    return _this.metricConfig.rendererName;
  };

  _this.getName = function() {
    return 'HDDFreeSpace';
  };

  _this.getHarmlessConfig = function() {
    const config = Object.create({ });
    config.lineColor = 'green';
    config.max = 100;
    config.min = 0;
    config.datasets = [];
    config.datasets.push(_this.getName());
    if (_this.metricConfig.settings.threshold) {
      config.ranges = [];
      config.ranges.push({ value:     _this.metricConfig.settings.threshold
                         , title:     `Critical (>${_this.metricConfig.settings.threshold.toFixed(2)})`
                         , lineColor: 'red'
                         });
    }
    return config;
  };

  _this.getData = function(callback) {
    const path = _this.metricConfig.settings.path;
    const regexp = /[ ]+([0-9]+)%[ ]+?/;
    const cmd = `df -h ${path}`;
    childProcess.exec(cmd, function(err, resp) {
      const parsed = regexp.exec(resp);
      if (parsed) {
        const value = parsed[1];
        const title = `HDD Free Space at ${path} (${_this.sensorConfig.name})`;
        const subTitle = `${value}% used`;
        callback.call(_this, { values:   [value]
                             , title:    title
                             , subTitle: subTitle
                             });
      }
    });
  };

  return _this;

};
