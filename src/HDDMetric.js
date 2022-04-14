const bytes = require('bytes');
const si = require('systeminformation');

const CustomMetric = require(`${__dirname}/CustomMetric.js`);

class HDDMetric extends CustomMetric {
  constructor(sensorConfig, metricConfig) {
    metricConfig.rendererName = metricConfig.rendererName || 'Chart';
    metricConfig.refreshInterval = metricConfig.refreshInterval || 30000;
    metricConfig.settings = Object.assign({
      mounts: '',
      threshold: 90
    },
    metricConfig.settings
    );

    super(sensorConfig, metricConfig);

    this.threshold = this.metricConfig.settings.threshold;
    this.mounts = this.metricConfig.settings.mounts;
    this.mountsList = [];
    if (this.mounts.length > 0) {
      this.mountsList = this.mounts.split(',').map(function(pathName) {
        return pathName.trim();
      });
    }
    this.realMounts = [];
  }

  getConfig() {
    const _this = this;

    return new Promise(function(resolve, reject) {
      si.blockDevices().then(function(data) {
        _this.realMounts = data.filter(function(device) {
          return !device.removable && (device.mount.length > 0);
        });
        _this.realMounts = _this.realMounts.map(function(device) {
          return device.mount;
        });
        si.fsSize().then(function(data) {
          const config = Object.create({});
          config.lineColor = 'green';
          config.max = 100;
          config.min = 0;
          config.settings = _this.mounts;
          config.datasets = [];
          let devices = data.filter(function(device) {
            return ((_this.realMounts.indexOf(device.mount) !== -1) && ((_this.mountsList.length === 0) || (_this.mountsList.indexOf(device.mount) !== -1)));
          });
          devices.map(function(device) {
            config.datasets.push(device.mount);
          });
          if (_this.threshold) {
            config.ranges = [];
            config.ranges.push({
              value: _this.threshold,
              title: `Critical (>${_this.threshold.toFixed(2)})`,
              lineColor: 'red',
            });
          }
          resolve(config);
        }, reject);
      }, reject);
    });
  }

  getData() {
    const _this = this;

    return new Promise(function(resolve, reject) {
      si.fsSize().then(function(data) {
        let devices = data.filter(function(device) {
          return ((_this.realMounts.indexOf(device.mount) !== -1) && ((_this.mountsList.length === 0) || (_this.mountsList.indexOf(device.mount) !== -1)));
        });
        let totalUsed = 0;
        let totalSize = 0;
        devices.map(function(device) {
          totalUsed += device.used;
          totalSize += device.size;
        });
        const usagePercent = totalUsed * 100 / totalSize;
        const points = [];
        const table = {
          header: ['mount', 'size', 'used', 'use', 'type', 'fs'],
          body: [],
        };
        devices.map(function(device) {
          points.push(device.use);
          table.body.push([
            device.mount,
            bytes(device.size),
            bytes(device.used),
            `${device.use}%`,
            device.type,
            device.fs
          ]);
        });
        const values = [];
        values.push({
          raw: usagePercent,
          threshold: usagePercent,
          formatted: `${usagePercent.toFixed(2)}%`,
          label: 'Used, %'
        });
        values.push({
          raw: totalUsed,
          formatted: bytes(totalUsed),
          label: 'Used, size'
        });
        values.push({
          raw: totalSize,
          formatted: bytes(totalSize),
          label: 'Total, size'
        });
        const title = `HDD`;
        const subTitle = `Total ${bytes(totalSize)}, Used ${bytes(totalUsed)} (${usagePercent.toFixed(2)}%)`;
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

module.exports = HDDMetric;
