const uid = require('uuid');
const childProcess = require('child_process');

module.exports.create = function(sensorConfig, metricConfig) {

  const _this = this;

  _this.sensorConfig = Object.assign({ }, sensorConfig);
  _this.metricConfig = Object.assign({ refreshInterval: 5000, rendererName: 'LineChart' }, metricConfig);

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
    return 'ProcessCount';
  };

  _this.getHarmlessConfig = function() {
    return { };
  };

  _this.getData = function(callback) {
    const title = `Process(es) count (${_this.sensorConfig.name})`;
    let cmd = 'ps ax';
    if (_this.metricConfig.mask) {
      cmd += ` | grep -E "${_this.metricConfig.mask}"`;
    }
    childProcess.exec(cmd, function(err, resp) {
      const list = resp.split("\n");
      let subTitle = `${list.length} process(es) running`;
      if (_this.metricConfig.mask) {
        subTitle += ` (${_this.metricConfig.mask})`;
      }
      callback.call(_this, { value: list.length
                           , label: `${list.length} process(es)`
                           , title: title
                           , subTitle: subTitle
                           });
    });
  };

  return _this;

};
