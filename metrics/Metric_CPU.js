const uid = require('uuid');
const si  = require('systeminformation');

module.exports.create = function(sensorConfig, metricConfig) {

  const _this = this;

  _this.sensorConfig = Object.assign({ }, sensorConfig);
  _this.metricConfig = Object.assign({ refreshInterval: 3000, rendererName: 'Chart' }, metricConfig);
  _this.metricConfig.settings = Object.assign({ }, _this.metricConfig.settings);

  _this.uid = uid.v4();

  const overload = 75;
  const critical = 90;

  _this.init = function () {

  };

  _this.getUid = function () {
    return _this.uid;
  };

  _this.getRendererName = function() {
    return _this.metricConfig.rendererName;
  };

  _this.getName = function() {
    return 'CPU';
  };

  _this.getHarmlessConfig = function() {
    const config = Object.create({ });
    config.lineColor = 'green';
    config.suggestedMax = 100;
    config.min = 0;
    config.datasets = [];
    if (_this.metricConfig.settings.processes) {
      config.datasets.push('Overall');
      _this.metricConfig.settings.processes.split(',').map(function(processName) {
        config.datasets.push(processName.trim());
      });
    } else {
      config.datasets.push(_this.getName());
    }
    config.ranges = [];
    config.ranges.push({ value: overload
                       , title: `Overload (>${critical.toFixed(2)})`
                       , lineColor: 'chocolate'
                       });
    config.ranges.push({ value: critical
                       , title: `Critical (>${overload.toFixed(2)})`
                       , lineColor: 'red'
                       });
    return config;
  };

  _this.getData = function(callback) {

    let results;

    si.currentLoad().then(function(stats) {
      const title    = `CPU Load ${stats.currentload.toFixed()}% (${_this.sensorConfig.name})`;
      const subTitle = `User ${stats.currentload_user.toFixed()}%, System ${stats.currentload_system.toFixed()}%, Idle ${stats.currentload_idle.toFixed()}%`;
      const value    = stats.currentload;
      const values = [];
      values.push(value);
      if (_this.metricConfig.settings.processes) {
        si.services(_this.metricConfig.settings.processes).then(function(stats) {
          stats.map(function(stat) {
            values.push(stat.pcpu);
          });
          callback.call(_this, { values:   values
                               , title:    title
                               , subTitle: subTitle
                               });
        });
      } else {
        callback.call(_this, { values:   values
                             , title:    title
                             , subTitle: subTitle
                             });
      }
    });

  };

  return _this;

};
