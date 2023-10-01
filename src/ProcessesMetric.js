const si = require('systeminformation');

const CustomMetric = require(__dirname + '/CustomMetric.js');

class ProcessesMetric extends CustomMetric {
  constructor(sensorConfig, metricConfig) {
    metricConfig.rendererName = metricConfig.rendererName || 'Chart';
    metricConfig.refreshInterval = metricConfig.refreshInterval || 5000;
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
    this.fields = ['pid', 'started', 'state', 'user', 'pcpu', 'mem_vsz', 'command', 'params'];
  }

  getConfig() {
    return new Promise((resolve) => {
      const config = Object.create({});
      config.lineColor = 'green';
      config.settings = this.processes;
      config.datasets = [];
      config.datasets.push('Total');
      this.processesList.map((processName) => {
        config.datasets.push(processName);
      });
      resolve(config);
    });
  }

  getData() {
    return new Promise((resolve, reject) => {
      si.processes().then((processes) => {
        let processStat = {};
        let foundProcesses = [];
        if (this.processesList.length > 0) {
          this.processesList.map((processName) => {
            processStat[processName] = 0;
            processes.list.map((processInfo) => {
              if (processInfo.name.indexOf(processName) !== -1) {
                processStat[processName]++;
                foundProcesses.push(processInfo);
              }
            });
          });
        } else {
          foundProcesses = processes.list;
        }
        const title = 'Process(es)';
        let subTitle = `${foundProcesses.length} process(es) running`;
        if (this.processesList.length > 0) {
          subTitle += ` [${this.processes}]`;
        }
        const points = [];
        points.push(foundProcesses.length);
        for (let processName in processStat) {
          points.push(processStat[processName]);
        }
        const table = {
          header: this.fields,
          body: [],
        };
        foundProcesses.map((processInfo) => {
          let row = [];
          this.fields.map((fieldName) => {
            row.push(processInfo[fieldName]);
          });
          table.body.push(row);
        });
        const values = [];
        values.push({
          raw: foundProcesses.length,
        });
        resolve({
          title: title,
          subTitle: subTitle,
          values: values,
          points: points,
          table: table,
        });
      }, reject);
    });
  }
}

module.exports = ProcessesMetric;
