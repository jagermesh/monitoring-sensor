const uid = require('uuid');
const mysql = require('mysql');

module.exports.create = function(sensorConfig, metricConfig) {

  const _this = this;

  _this.sensorConfig = Object.assign({ }, sensorConfig);
  _this.metricConfig = Object.assign({ refreshInterval: 5000, rendererName: 'Table' }, metricConfig);

  _this.uid = uid.v4();

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
    return { fields: { 'Time': 'Time', 'Info': 'Info' } };
  };

  _this.getData = function(callback) {
    const title = `MySQL process(es) list (${_this.sensorConfig.name})`;
    mysqlConnection.query('SHOW FULL PROCESSLIST', function(err, rows) {
      let list = [];
      for(let i = 0; i < rows.length; i++) {
        if (rows[i].Command != 'Sleep') {
          if (rows[i].Info != 'SHOW FULL PROCESSLIST') {
            list.push( { row: { Time: rows[i].Time, Info: rows[i].Info }});
          }
        }
      }
      const subTitle = `${list.length} process(es) running`;
      callback.call(_this, { list: list
                           , title: title
                           , subTitle: subTitle
                           });
    });
  };

  return _this;

};
