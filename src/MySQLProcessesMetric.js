const mysql = require('mysql');

const CustomMetric = require(__dirname + '/CustomMetric.js');

class MySQLProcessesMetric extends CustomMetric {

  constructor(sensorConfig, metricConfig) {
    super(sensorConfig, metricConfig);

    this.rendererName    = this.rendererName || 'Table';
    this.refreshInterval = this.refreshInterval || 5000;
    this.fields          = ['Id', 'User', 'Host', 'db', 'Command', 'Time', 'State', 'Progress', 'Info'];
    this.connectionsPool = mysql.createPool({
      connectionLimit: 10,
      host: this.metricConfig.settings.host,
      user: this.metricConfig.settings.user,
      password: this.metricConfig.settings.password,
    });
  }

  getConfig() {
    return new Promise(function(resolve) {
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
      _this.connectionsPool.getConnection(function(error, connection) {
        if (error) {
          reject(error.sqlMessage);
          return;
        }
        _this.mysqlConnection.query('SHOW FULL PROCESSLIST', function (error, results) {
          connection.release();
          if (error) {
            reject(error.sqlMessage);
            return;
          }
          const table = {
            header: _this.fields,
            body: [],
          };
          const mySqlProcesses = results.filter(function (mySqlProcess) {
            return ((mySqlProcess.Command !== 'Sleep') && (mySqlProcess.Info !== 'SHOW FULL PROCESSLIST'));
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
    });
  }

}

module.exports = MySQLProcessesMetric;
