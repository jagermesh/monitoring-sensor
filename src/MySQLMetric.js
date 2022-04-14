const mysql = require('mysql');
const Handlebars = require('handlebars');
const moment = require('moment');

const CustomMetric = require(__dirname + '/CustomMetric.js');

class MySQLMetric extends CustomMetric {
  constructor(sensorConfig, metricConfig) {
    metricConfig.rendererName = metricConfig.rendererName || 'Table';
    metricConfig.refreshInterval = metricConfig.refreshInterval || 60000;
    metricConfig.settings = Object.assign({
      description: 'MySQL Query'
    }, metricConfig.settings);

    super(sensorConfig, metricConfig);

    this.query = Handlebars.compile(this.metricConfig.settings.sql);
    this.description = this.metricConfig.settings.description;
    this.fields = this.metricConfig.settings.fields;
    this.updateQueryVariables();
    this.connectionsPool = mysql.createPool({
      connectionLimit: 10,
      host: this.metricConfig.settings.host,
      user: this.metricConfig.settings.user,
      password: this.metricConfig.settings.password,
      database: this.metricConfig.settings.database,
    });
  }

  updateQueryVariables() {
    this.queryVariables = {
      lastRunAt: moment().format('YYYY-MM-DD HH:mm:ss')
    };
  }

  getConfig() {
    const _this = this;

    return new Promise(function(resolve) {
      const config = Object.create({});
      config.lineColor = 'green';
      config.datasets = (_this.metricConfig.settings.datasets ? _this.metricConfig.settings.datasets : ['Count']);
      resolve(config);
    });
  }

  filterRow() {
    return true;
  }

  getData() {
    const _this = this;

    return new Promise(function(resolve, reject) {
      _this.connectionsPool.getConnection(function(error, connection) {
        if (error) {
          reject(error.sqlMessage);
          return;
        }
        connection.query(_this.query(_this.queryVariables), function(error, results, fields) {
          connection.release();
          if (error) {
            reject(error.sqlMessage);
            return;
          }
          _this.updateQueryVariables();
          const filteredResults = results.filter(function(result) {
            return _this.filterRow(result);
          });

          const title = _this.description;
          const subTitle = _this.metricConfig.settings.database ? `${_this.metricConfig.settings.database}@${_this.metricConfig.settings.host}` : _this.metricConfig.settings.host;
          const points = [];
          if (_this.metricConfig.settings.datasets) {
            if (filteredResults.length > 0) {
              _this.metricConfig.settings.datasets.map(function(dataset) {
                points.push(filteredResults[0][dataset]);
              });
            }
          } else {
            points.push(filteredResults.length);
          }
          const values = [];
          values.push({
            raw: filteredResults.length,
            formatted: filteredResults.length
          });
          const table = {
            header: [],
            body: [],
          };
          table.header = _this.fields ? _this.fields : fields.map(function(field) {
            return field.name;
          });
          if (filteredResults.length > 0) {
            for (let i = 0; i < filteredResults.length; i++) {
              let row = [];
              table.header.map(function(fieldName) {
                row.push(filteredResults[i][fieldName]);
              });
              table.body.push(row);
            }
          }
          resolve({
            title: title,
            subTitle: subTitle,
            values: values,
            points: points,
            table: table,
          });
        });
      });
    });
  }
}

module.exports = MySQLMetric;
