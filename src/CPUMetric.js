const os = require('os');
const si = require('systeminformation');

const CustomMetric = require(`${__dirname}/CustomMetric.js`);

class CPUMetric extends CustomMetric {
  constructor(sensorConfig, metricConfig) {
    metricConfig.rendererName = metricConfig.rendererName || 'Chart';
    metricConfig.refreshInterval = metricConfig.refreshInterval || 3000;
    metricConfig.settings = Object.assign({
      processes: '',
    }, metricConfig.settings);

    super(sensorConfig, metricConfig);

    this.processes = this.metricConfig.settings.processes;
    this.processesList = [];
    if (this.processes.length > 0) {
      this.processesList = this.processes.split(',').map((processName) => {
        return processName.trim();
      });
    }
    this.cpus = os.cpus().length;
  }

  getConfig() {
    return new Promise((resolve) => {
      const overload = 75;
      const critical = 90;
      const config = Object.create({});
      config.lineColor = 'green';
      config.suggestedMax = 100;
      config.min = 0;
      config.settings = this.processes;
      config.datasets = [];
      config.datasets.push('Overall');
      if (this.processesList.length > 0) {
        this.processesList.map((processName) => {
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
    return new Promise((resolve, reject) => {
      si.currentLoad().then((stats) => {
        const currentLoad = stats.currentLoad;
        const currentLoadUser = stats.currentLoadUser;
        const currentLoadSystem = stats.currentLoadSystem;
        const currentLoadIdle = stats.currentLoadIdle;
        const title = `CPU Load ${this.cpus} CPUs`;
        const subTitle = `Overall ${currentLoad.toFixed(2)}%,  User ${currentLoadUser.toFixed(2)}%, System ${currentLoadSystem.toFixed(2)}%, Idle ${currentLoadIdle.toFixed(2)}%`;
        const points = [];
        points.push(currentLoad);
        const values = [];
        const table = {
          header: [],
          body: [],
        };
        if (this.processesList.length > 0) {
          table.header = ['Process', 'CPU', 'Memory'];
          si.services(this.processes).then((stats) => {
            let max = 0;
            let avg = 0;
            let sum = 0;
            stats.map((stat) => {
              table.body.push([stat.name, `${stat.cpu.toFixed(2)}%`, `${stat.mem.toFixed(2)}%`]);
              points.push(stat.cpu);
              if (stat.cpu > max) {
                max = stat.cpu;
              }
              sum += stat.cpu;
            });
            if (stats.length > 0) {
              avg = sum / stats.length;
            }
            values.push({
              raw: avg,
              threshold: avg,
              formatted: `${avg.toFixed(2)}%`,
              label: 'Avg',
            });
            values.push({
              raw: max,
              formatted: `${max.toFixed(2)}%`,
              label: 'Max',
            });
            resolve({
              title: title,
              subTitle: subTitle,
              values: values,
              points: points,
              table: table,
            });
          }, reject);
        } else {
          table.body.push(['Overall', `${currentLoad.toFixed(2)}%`]);
          table.body.push(['User', `${currentLoadUser.toFixed(2)}%`]);
          table.body.push(['System', `${currentLoadSystem.toFixed(2)}%`]);
          table.body.push(['Idle', `${currentLoadIdle.toFixed(2)}%`]);
          points.push(currentLoadUser);
          points.push(currentLoadSystem);
          values.push({
            raw: currentLoad,
            threshold: currentLoad,
            formatted: `${currentLoad.toFixed(2)}%`,
          });
          resolve({
            title: title,
            subTitle: subTitle,
            values: values,
            points: points,
            table: table,
          });
        }
      }, reject);
    });
  }
}

module.exports = CPUMetric;
