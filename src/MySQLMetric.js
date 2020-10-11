const mysql = require('mysql');
const Handlebars = require('handlebars');
const moment = require('moment');

const CustomMetric = require(__dirname + '/CustomMetric.js');

class MySQLMetric extends CustomMetric {

  constructor(sensorConfig, metricConfig) {
    super(sensorConfig, metricConfig);

    this.rendererName    = this.rendererName || 'Table';
    this.refreshInterval = this.refreshInterval || 60000;
    this.connectionsPool = mysql.createPool({
      connectionLimit: 10,
      host: this.metricConfig.settings.host,
      user: this.metricConfig.settings.user,
      password: this.metricConfig.settings.password,
      database: this.metricConfig.settings.database,
    });
    this.query = Handlebars.compile(this.metricConfig.settings.sql);
    this.updateQueryVariables();
  }

  updateQueryVariables() {
    this.queryVariables = {
      lastRunAt: moment().format('YYYY-MM-DD HH:mm:ss')
    };
  }

  getConfig() {
    const _this = this;

    return new Promise(function(resolve) {
      const config = Object.create({ });
      config.lineColor = 'green';
      config.datasets = (_this.metricConfig.settings.datasets ? _this.metricConfig.settings.datasets : [ 'Count' ]);
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
        console.log(_this.query(_this.queryVariables));
        connection.query(_this.query(_this.queryVariables), function (error, results, fields) {
          connection.release();
          if (error) {
            reject(error.sqlMessage);
            return;
          }
          _this.updateQueryVariables();
          const title    = _this.metricConfig.settings.description ? _this.metricConfig.settings.description : 'MySQL Query';
          const subTitle = _this.metricConfig.settings.database;
          const points   = [];
          if (_this.metricConfig.settings.datasets) {
            if (results.length > 0) {
              _this.metricConfig.settings.datasets.map(function(dataset) {
                points.push(results[0][dataset]);
              });
            }
          } else {
            points.push(results.length);
          }
          const values = [];
          values.push({ raw: results.length, formatted: results.length });
          const table = {
            header: [],
            body: [],
          };
          fields.map(function(field) {
            table.header.push(field.name);
          });
          if (results.length > 0) {
            for(let i = 0; i < results.length; i++) {
              let row = [];
              for(let name in results[i]) {
                row.push(results[i][name]);
              }
              table.body.push(row);
            }
          }
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

module.exports = MySQLMetric;
