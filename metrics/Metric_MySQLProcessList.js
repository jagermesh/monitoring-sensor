const uid = require('uuid');
const mysql = require('mysql');

module.exports.create = function(sensorConfig, metricConfig) {

  const _this = this;

  _this.sensorConfig = Object.assign({ }, sensorConfig);
  _this.metricConfig = Object.assign({ refreshInterval: 5000, rendererName: 'Table' }, metricConfig);
  _this.metricConfig.settings = Object.assign({ }, _this.metricConfig.settings);

  _this.uid = uid.v4();

  let fields = ['Id', 'User', 'Host', 'db', 'Command', 'Time', 'State', 'Progress', 'Info'];

  const mysqlConnection = mysql.createConnection({
      host:     _this.metricConfig.settings.host
    , user:     _this.metricConfig.settings.user
    , password: _this.metricConfig.settings.password
  });

  _this.init = function () {

  };

  _this.getUid = function () {
    return _this.uid;
  };

  _this.getRendererName = function() {
    return _this.metricConfig.rendererName;
  };

  _this.getName = function() {
    return 'MySQLProcessList';
  };

  _this.getHarmlessConfig = function() {
    return { };
  };

  _this.getData = function(callback) {
    mysqlConnection.query('SHOW FULL PROCESSLIST', function(err, rows) {

      const body = [];
      const list = {};
      if (_this.metricConfig.rendererName == 'Table') {
        rows.map(function(mysqlProcess) {
          if ((mysqlProcess.Command != 'Sleep') && (mysqlProcess.Info != 'SHOW FULL PROCESSLIST')) {
            let row = [];
            fields.map(function(fieldName) {
              row.push(mysqlProcess[fieldName]);
            });
            body.push(row);
          }
        });
        list.header = fields;
        list.body   = body;
      }

      const title = `MySQL process(es) list (${_this.sensorConfig.name})`;
      const subTitle = `${list.body.length} process(es) running`;
      callback.call(_this, { list:     list
                           , title:    title
                           , subTitle: subTitle
                           });
    });
  };

  return _this;

};
