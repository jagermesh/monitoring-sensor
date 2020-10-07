const moment = require('moment');
const axios = require('axios');

const CustomMetric = require(__dirname + '/CustomMetric.js');

class JenkinsMetric extends CustomMetric {

  constructor(sensorConfig, metricConfig) {
    super(sensorConfig, metricConfig);

    this.rendererName    = this.rendererName || 'Table';
    this.refreshInterval = this.refreshInterval || 5000;
    this.fields          = ['Id', 'User', 'Host', 'db', 'Command', 'Time', 'State', 'Progress', 'Info'];
    this.apiUrl          = this.metricConfig.settings.apiUrl;
    this.cache           = new Map();
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

  formatDate(d) {
    let result = '';
    let m = moment(d);
    if (m.isSame(new Date(), 'day')) {
      result = m.format('LT');
    } else
    if (m.isSame(new Date(), 'year')) {
      result = m.format('MMM D, LT');
    } else {
      result = m.format('L LT');
    }
    return result;
  }

  formatStatusName(name) {
    switch(name) {
      case 'SUCCESS':
        return `<span style="color:green;">Success</span>`;
      case 'FAILURE':
        return `<span style="color:red;">Failed</span>`;
      case 'ABORTED':
        return `<span style="color:orange;">Cancelled</span>`;
      default:
        return `<span style="color:white;">${name}</span>`;
    }
  }

  getData() {
    const _this = this;

    return new Promise(function(resolve, reject) {
      axios.get(_this.apiUrl + 'api/json').then(async function(response) {
        let builds = response.data.builds;
        if (builds && (builds.length > 0)) {
          let allBuilds = [];
          let missingBuilds = [];

          builds.map(function(build) {
            if (_this.cache.has(build.number)) {
              allBuilds.push(_this.cache.get(build.number));
            } else {
              missingBuilds.push(build);
            }
          });

          await missingBuilds.reduce(function(promise, build) {
            return promise.then(function() {
              return axios.get(`${build.url}api/json`).then(function(response) {
                let build = response.data;
                if (build.building) {
                  build.status = 'RUNNING';
                } else {
                  build.status = response.data.result;
                }
                allBuilds.push(build);
                if (!build.building) {
                  _this.cache.set(build.number, build);
                }
              });
            });
          }, Promise.resolve());

          allBuilds.sort(function compare(a, b) {
            return (a.number > b.number ? -1 : (a.number < b.number ? 1 : 0));
          });

          let activeBuilds  = allBuilds.filter(function(build) { return response.data.building; });
          let successBuilds = allBuilds.filter(function(build) { return (!response.data.building && (build.result === 'SUCCESS')); });
          let failedBuilds  = allBuilds.filter(function(build) { return (!response.data.building && (build.result === 'FAILURE')); });

          const title = 'Jenkins Builds';
          const subTitle = `Total ${allBuilds.length}, Active ${activeBuilds.length}, Success ${successBuilds.length}, Failed ${failedBuilds.length}`;
          const points = [];
          points.push(activeBuilds.length);
          const values = [];
          values.push({ raw: activeBuilds.length, label: 'Running' });
          values.push({ raw: successBuilds.length, formatted: `<span style="color:green;">${successBuilds.length}</span>`, label: 'Success' });
          values.push({ raw: failedBuilds.length, formatted: `<span style="color:red;">${failedBuilds.length}</span>`, label: 'Failed' });
          const table = { header: [], body: [] };
          table.header = [
            'Number',
            'Status',
            'Name',
            'Started',
            'Duration',
            'Est Duration',
            'Console output',
            'Status page',
          ];
          allBuilds.map(function(build) {
            let duration = build.duration/1000/60;
            table.body.push([
              build.number,
              _this.formatStatusName(build.status),
              build.displayName,
              _this.formatDate(build.timestamp),
              `${duration.toFixed()} Min`,
              (build.building ? _this.formatDate(build.timestamp + build.estimatedDuration) : ''),
              `<a href="${_this.apiUrl}${build.id}/console" target="_blank">Console output</a>`,
              `<a href="${_this.apiUrl}${build.id}" target="_blank">Status page</a>`,
            ]);
          });

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

module.exports = JenkinsMetric;
