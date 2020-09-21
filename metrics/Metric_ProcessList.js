const uid = require('uuid');
const childProcess = require('child_process');

module.exports.create = function(sensorConfig, metricConfig) {

  const _this = this;

  _this.sensorConfig = Object.assign({ }, sensorConfig);
  _this.metricConfig = Object.assign({ refreshInterval: 5000, rendererName: 'Table' }, metricConfig);

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
    return _this.metricConfig.rendererName;
  };

  _this.getHarmlessConfig = function() {
    return { };
  };

  _this.getData = function(callback) {
    const title = `Process(es) list (${_this.sensorConfig.name})`;
    let cmd = 'ps ax';
    if (_this.metricConfig.mask) {
      cmd += ` | grep -E "${_this.metricConfig.mask}"`;
    }
    childProcess.exec(cmd, function(err, resp) {
      const inList = resp.split("\n");
      let list = [];
      for(let i = 1; i < inList.length; i++) {
        if (inList[i].length > 0) {
          list.push({ row: { cmd: inList[i] }});
        }
      }
      let subTitle = `${list.length} process(es) running`;
      if (_this.metricConfig.mask) {
        subTitle += ` (${_this.metricConfig.mask})`;
      }
      callback.call(_this, { list: list
                           , title: title
                           , subTitle: subTitle
                           });
    });
  };

  return _this;

};
