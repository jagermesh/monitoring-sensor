const mysql = require('mysql');
const Handlebars = require('handlebars');
const moment = require('moment');

const CustomMetric = require(__dirname + '/CustomMetric.js');

class MySQLMetric extends CustomMetric {
  constructor(sensorConfig, metricConfig) {
    metricConfig.rendererName = metricConfig.rendererName || 'Table';
    metricConfig.refreshInterval = metricConfig.refreshInterval || 60000;
    metricConfig.settings = Object.assign({
      description: 'MySQL Query',
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
      lastRunAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
  }

  getConfig() {
    return new Promise((resolve) => {
      const config = Object.create({});
      config.lineColor = 'green';
      config.datasets = (this.metricConfig.settings.datasets ? this.metricConfig.settings.datasets : ['Count']);
      resolve(config);
    });
  }

  filterRow() {
    return true;
  }

  getData() {
    return new Promise((resolve, reject) => {
      this.connectionsPool.getConnection((error, connection) => {
        if (error) {
          reject(error.sqlMessage);
          return;
        }
        connection.query(this.query(this.queryVariables), (error, results, fields) => {
          connection.release();
          if (error) {
            reject(error.sqlMessage);
            return;
          }
          this.updateQueryVariables();
          const filteredResults = results.filter((result) => {
            return this.filterRow(result);
          });

          const title = this.description;
          const subTitle = this.metricConfig.settings.database ? `${this.metricConfig.settings.database}@${this.metricConfig.settings.host}` : this.metricConfig.settings.host;
          const points = [];
          if (this.metricConfig.settings.datasets) {
            if (filteredResults.length > 0) {
              this.metricConfig.settings.datasets.map((dataset) => {
                points.push(filteredResults[0][dataset]);
              });
            }
          } else {
            points.push(filteredResults.length);
          }
          const values = [];
          values.push({
            raw: filteredResults.length,
            formatted: filteredResults.length,
          });
          const table = {
            header: [],
            body: [],
          };
          table.header = this.fields ? this.fields : fields.map((field) => {
            return field.name;
          });
          if (filteredResults.length > 0) {
            for (let i = 0; i < filteredResults.length; i++) {
              let row = [];
              table.header.map((fieldName) => {
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
