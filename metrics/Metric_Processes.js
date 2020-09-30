const uid = require('uuid');
const si  = require('systeminformation');

module.exports.create = function(sensorConfig, metricConfig) {

  const _this = this;

  _this.sensorConfig = Object.assign({ }, sensorConfig);
  _this.metricConfig = Object.assign({ refreshInterval: 5000, rendererName: 'Chart' }, metricConfig);
  _this.metricConfig.settings = Object.assign({ processes: '' }, _this.metricConfig.settings);

  _this.uid = uid.v4();

  let fields = ['pid', 'started', 'state', 'user', 'pcpu', 'mem_vsz', 'command', 'params'];

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
    const config = Object.create({ });
    config.lineColor = 'green';
    config.datasets = [];
    config.datasets.push(_this.getName());
    return config;
  };

  _this.getData = function(callback) {
    si.processes().then(function(processes) {
      if (_this.metricConfig.settings.processes.length > 0) {
        processes.list = processes.list.filter(function(processInfo) {
          return processInfo.name.indexOf(_this.metricConfig.settings.processes) != -1;
        });
      }
      const title    = `Process(es) (${_this.sensorConfig.name})`;
      const subTitle = `${processes.list.length} ${_this.metricConfig.settings.processes} process(es) running`;
      const value    = processes.list.length;
      const body     = [];
      const list     = {};
      if (_this.metricConfig.rendererName == 'Table') {
        processes.list.map(function(processInfo) {
          let row = [];
          fields.map(function(fieldName) {
            row.push(processInfo[fieldName]);
          });
          body.push(row);
        });
        list.header = fields;
        list.body   = body;
      }
      callback.call(_this, { values:   [value]
                           , list:     list
                           , title:    title
                           , subTitle: subTitle
                           });
    });
  };

  return _this;

};
