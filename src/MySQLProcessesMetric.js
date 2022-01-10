const mysql = require('mysql');

const MySQLMetric = require(__dirname + '/MySQLMetric.js');

class MySQLProcessesMetric extends MySQLMetric {

  constructor(sensorConfig, metricConfig) {
    metricConfig.rendererName = metricConfig.rendererName || 'Table';
    metricConfig.refreshInterval = metricConfig.refreshInterval || 5000;
    metricConfig.settings = Object.assign({
        sql: 'SHOW FULL PROCESSLIST',
        description: 'MySQL Processes',
        fields: ['Id', 'User', 'Host', 'db', 'Command', 'Time', 'State', 'Progress', 'Info']
      },
      metricConfig.settings
    );

    super(sensorConfig, metricConfig);
  }

  filterRow(result) {
    const _this = this;

    return ((result.Command !== 'Sleep') && (result.Info !== 'SHOW FULL PROCESSLIST'));
  }

}

module.exports = MySQLProcessesMetric;