const mysql = require('mysql');

const CustomMetric = require(__dirname + '/CustomMetric.js');

class MySQLProcessesMetric extends CustomMetric {

  constructor(sensorConfig, metricConfig) {
    super(sensorConfig, metricConfig);

    this.rendererName    = this.rendererName || 'Table';
    this.refreshInterval = this.refreshInterval || 5000;
    this.fields          = ['Id', 'User', 'Host', 'db', 'Command', 'Time', 'State', 'Progress', 'Info'];
    this.mysqlConnection = mysql.createConnection({
        host:     this.metricConfig.settings.host
      , user:     this.metricConfig.settings.user
      , password: this.metricConfig.settings.password
    });
  }

  getConfig() {
    const _this = this;

    return new Promise(function(resolve, reject) {
      const config = Object.create({ });
      config.lineColor = 'green';
      config.datasets = [];
      config.datasets.push('Total');
      resolve(config);
    });
  }

  getData() {
    const _this = this;

    return new Promise(function(resolve, reject) {
      _this.mysqlConnection.query('SHOW FULL PROCESSLIST', function (err, rows) {
        const table = {
            header: _this.fields
          , body:    []
        };
        const mySqlProcesses = rows.filter(function (mySqlProcess) {
          return ((mySqlProcess.Command != 'Sleep') && (mySqlProcess.Info != 'SHOW FULL PROCESSLIST'));
        });
        mySqlProcesses.map(function(mySqlProcess) {
          let row = [];
          _this.fields.map(function (fieldName) {
            row.push(mySqlProcess[fieldName]);
          });
          table.body.push(row);
        });
        const title    = `MySQL process(es)`;
        const subTitle = `${mySqlProcesses.length} process(es) running at ${_this.metricConfig.settings.host}`;
        const value    = mySqlProcesses.length;
        const points   = [];
        points.push(mySqlProcesses.length);
        const values = [];
        values.push({ raw: mySqlProcesses.length, formatted: mySqlProcesses.length });
        resolve({
          title:    title,
          subTitle: subTitle,
          values:   values,
          points:   points,
          table:    table,
        });
      });
    });
  }

}

module.exports = MySQLProcessesMetric;
