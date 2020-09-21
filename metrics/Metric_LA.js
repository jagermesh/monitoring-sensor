const uid = require('uuid');
const os = require('os');

module.exports.create = function(sensorConfig, metricConfig) {

  const _this = this;

  _this.sensorConfig = Object.assign({ }, sensorConfig);
  _this.metricConfig = Object.assign({ refreshInterval: 3000, rendererName: 'LineChart' }, metricConfig);

  _this.uid = uid.v4();

  const cpus     = os.cpus().length;
  const critical = cpus * 0.75;
  const overload = cpus;

  _this.init = function () {

  };

  _this.getUid = function () {
    return _this.uid;
  };

  _this.getRendererName = function() {
    return _this.metricConfig.rendererName;
  };

  _this.getName = function() {
    return 'LA';
  };

  _this.getHarmlessConfig = function() {
    const config = Object.create({ });
    config.ranges = [];
    config.ranges.push({ value: overload
                       , title: `Overload (>${critical.toFixed(2)})`
                       , color: 'rgb(180, 0, 180)'
                       });
    config.ranges.push({ value: critical
                       , title: `Critical (>${overload.toFixed(2)})`
                       , color: 'red'
                       });
    return config;
  };

  function writeValue(value, critical, overload) {
    let message = '<b';
    if (value > overload) {
      message += ' style="color:red;"';
    } else
    if (value > critical) {
      message += ' style="color:rgb(180, 0, 180);"';
    }
    message += `>${value.toFixed(2)}</b>`;
    return message;
  }

  _this.getData = function(callback) {
    const la       = os.loadavg();
    const title    = `LA ${cpus} CPUs (${_this.sensorConfig.name})`;
    const value    = la[0];
    const subTitle = writeValue(la[0], critical, overload) + ' · ' + writeValue(la[1], critical, overload) + ' · ' + writeValue(la[2], critical, overload);
    callback.call(_this, { value: value
                         , title: title
                         , subTitle: subTitle
                         });
  };

  return _this;

};
