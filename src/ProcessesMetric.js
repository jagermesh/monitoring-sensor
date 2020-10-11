const si = require('systeminformation');

const CustomMetric = require(__dirname + '/CustomMetric.js');

class ProcessesMetric extends CustomMetric {

  constructor(sensorConfig, metricConfig) {
    metricConfig.rendererName = metricConfig.rendererName || 'Chart';
    metricConfig.refreshInterval = metricConfig.refreshInterval || 5000;
    metricConfig.settings = Object.assign({ processes: '' }, metricConfig.settings);

    super(sensorConfig, metricConfig);

    this.processes  = this.metricConfig.settings.processes;
    this.processesList = [];
    if (this.processes.length > 0) {
      this.processesList = this.processes.split(',').map(function(processName) {
        return processName.trim();
      });
    }
    this.fields = ['pid', 'started', 'state', 'user', 'pcpu', 'mem_vsz', 'command', 'params'];
  }

  getConfig() {
    const _this = this;

    return new Promise(function(resolve) {
      const config = Object.create({ });
      config.lineColor = 'green';
      config.settings = _this.processes;
      config.datasets = [];
      config.datasets.push('Total');
      _this.processesList.map(function(processName) {
        config.datasets.push(processName);
      });
      resolve(config);
    });
  }

  getData() {
    const _this = this;

    return new Promise(function(resolve, reject) {
      si.processes().then(function(processes) {
        let processStat = {};
        let foundProcesses = [];
        if (_this.processesList.length > 0) {
          _this.processesList.map(function(processName) {
            processStat[processName] = 0;
            processes.list.map(function(processInfo) {
              if (processInfo.name.indexOf(processName) !== -1) {
                processStat[processName]++;
                foundProcesses.push(processInfo);
              }
            });
          });
        } else {
          foundProcesses = processes.list;
        }
        const title    = `Process(es)`;
        let subTitle = `${foundProcesses.length} process(es) running`;
        if (_this.processesList.length > 0) {
          subTitle += ` [${_this.processes}]`;
        }
        const points = [];
        points.push(foundProcesses.length);
        for(let processName in processStat) {
          points.push(processStat[processName]);
        }
        const table = {
          header: _this.fields,
          body:    [],
        };
        foundProcesses.map(function(processInfo) {
          let row = [];
          _this.fields.map(function(fieldName) {
            row.push(processInfo[fieldName]);
          });
          table.body.push(row);
        });
        const values = [];
        values.push({ raw: foundProcesses.length });
        resolve({
          title:    title,
          subTitle: subTitle,
          values:   values,
          points:   points,
          table:    table,
        });
      }, reject);
    });
  }

}

module.exports = ProcessesMetric;
