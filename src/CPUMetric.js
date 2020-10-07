const os = require('os');
const si = require('systeminformation');

const CustomMetric = require(__dirname + '/CustomMetric.js');

class CPUMetric extends CustomMetric {

  constructor(sensorConfig, metricConfig) {
    super(sensorConfig, metricConfig);

    this.rendererName    = this.rendererName || 'Chart';
    this.refreshInterval = this.refreshInterval || 3000;
    this.metricSettings  = Object.assign({ processes: '' }, this.metricConfig.settings);
    this.metricSettings.processesList = [];
    if (this.metricSettings.processes.length > 0) {
      this.metricSettings.processesList = this.metricSettings.processes.split(',').map(function(processName) {
        return processName.trim();
      });
    }
    this.cpus = os.cpus().length;
  }

  getConfig() {
    const _this = this;

    return new Promise(function(resolve) {
      const overload = 75;
      const critical = 90;
      const config = Object.create({ });
      config.lineColor = 'green';
      config.suggestedMax = 100;
      config.min = 0;
      config.settings = _this.metricSettings.processes;
      config.datasets = [];
      config.datasets.push('Overall');
      if (_this.metricSettings.processesList.length > 0) {
        _this.metricSettings.processesList.map(function(processName) {
          config.datasets.push(processName);
        });
      } else {
        config.datasets.push('User');
        config.datasets.push('System');
      }
      config.ranges = [];
      config.ranges.push({
        value: overload,
        title: `Overload (>${overload.toFixed(2)})`,
        lineColor: 'chocolate',
      });
      config.ranges.push({
        value: critical,
        title: `Critical (>${critical.toFixed(2)})`,
        lineColor: 'red',
      });
      resolve(config);
    });
  }

  getData() {
    const _this = this;

    return new Promise(function(resolve, reject) {
      si.currentLoad().then(function (stats) {
        const currentLoad       = stats.currentload;
        const currentLoadUser   = stats.currentload_user;
        const currentLoadSystem = stats.currentload_system;
        const currentLoadIdle   = stats.currentload_idle;
        const title             = `CPU Load ${_this.cpus} CPUs`;
        const subTitle          = `Overall ${currentLoad.toFixed(2)}%,  User ${currentLoadUser.toFixed(2)}%, System ${currentLoadSystem.toFixed(2)}%, Idle ${currentLoadIdle.toFixed(2)}%`;
        const points            = [];
        points.push(currentLoad);
        const values = [];
        const table = { header: [], body: [] };
        if (_this.metricSettings.processesList.length > 0) {
          table.header = ['Process', 'CPU', 'Memory'];
          si.services(_this.metricSettings.processes).then(function (stats) {
            let max = 0;
            let avg = 0;
            let sum = 0;
            stats.map(function (stat) {
              table.body.push([stat.name, `${stat.pcpu.toFixed(2)}%`, `${stat.pmem.toFixed(2)}%`]);
              points.push(stat.pcpu);
              if (stat.pcpu > max) {
                max = stat.pcpu;
              }
              sum += stat.pcpu;
            });
            if (stats.length > 0) {
              avg = sum/stats.length;
            }
            values.push({ raw: avg, threshold: avg, formatted: `${avg.toFixed(2)}%`, label: 'Avg' });
            values.push({ raw: max, formatted: `${max.toFixed(2)}%`, label: 'Max' });
            resolve({
              title:    title,
              subTitle: subTitle,
              values:   values,
              points:   points,
              table:    table,
            });
          }, reject);
        } else {
          table.body.push(['Overall', `${currentLoad.toFixed(2)}%`]);
          table.body.push(['User',    `${currentLoadUser.toFixed(2)}%`]);
          table.body.push(['System',  `${currentLoadSystem.toFixed(2)}%`]);
          table.body.push(['Idle',    `${currentLoadIdle.toFixed(2)}%`]);
          points.push(currentLoadUser);
          points.push(currentLoadSystem);
          values.push({ raw: currentLoad, threshold: currentLoad, formatted: `${currentLoad.toFixed(2)}%` });
          resolve({
            title:    title,
            subTitle: subTitle,
            values:   values,
            points:   points,
            table:    table,
          });
        }
      }, reject);
    });
  }

}

module.exports = CPUMetric;
