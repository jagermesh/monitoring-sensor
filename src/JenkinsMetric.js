const moment = require('moment');
const axios = require('axios');

const CustomMetric = require(__dirname + '/CustomMetric.js');

class JenkinsMetric extends CustomMetric {
  constructor(sensorConfig, metricConfig) {
    metricConfig.rendererName = metricConfig.rendererName || 'Table';
    metricConfig.refreshInterval = metricConfig.refreshInterval || 5000;

    super(sensorConfig, metricConfig);

    this.apiUrl = this.metricConfig.settings.apiUrl;
    this.fields = ['Id', 'User', 'Host', 'db', 'Command', 'Time', 'State', 'Progress', 'Info'];
    this.cache = new Map();
  }

  getConfig() {
    return new Promise((resolve) => {
      const config = Object.create({});
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
    } else if (m.isSame(new Date(), 'year')) {
      result = m.format('MMM D, LT');
    } else {
      result = m.format('L LT');
    }
    return result;
  }

  formatStatusName(name) {
    switch (name) {
      case 'SUCCESS':
        return '<span style="color:green;">Success</span>';
      case 'FAILURE':
        return '<span style="color:red;">Failed</span>';
      case 'ABORTED':
        return '<span style="color:orange;">Cancelled</span>';
      default:
        return `<span style="color:white;">${name}</span>`;
    }
  }

  getData() {
    return new Promise((resolve, reject) => {
      const params = {};
      if (this.metricConfig.settings.username || this.metricConfig.settings.password) {
        params.auth = {
          username: this.metricConfig.settings.username,
          password: this.metricConfig.settings.password,
        };
      }
      axios.get(this.apiUrl + 'api/json', params).then(async (response) => {
        let builds = response.data.builds;
        let allBuilds = [];
        let missingBuilds = [];

        builds.map((build) => {
          if (this.cache.has(build.number)) {
            allBuilds.push(this.cache.get(build.number));
          } else {
            missingBuilds.push(build);
          }
        });

        await missingBuilds.reduce((promise, build) => {
          return promise.then(() => {
            return axios.get(`${build.url}api/json`, params).then((response) => {
              let build = response.data;
              build.building = (build.building || !build.result);
              if (build.building) {
                build.status = 'RUNNING';
              } else {
                build.status = build.result;
                this.cache.set(build.number, build);
              }
              allBuilds.push(build);
            });
          });
        }, Promise.resolve());

        allBuilds.sort((a, b) => {
          return (a.number > b.number ? -1 : (a.number < b.number ? 1 : 0));
        });

        let activeBuilds = allBuilds.filter((build) => {
          return build.building;
        });

        let successBuilds = allBuilds.filter((build) => {
          return (!build.building && (build.result === 'SUCCESS'));
        });

        let failedBuilds = allBuilds.filter((build) => {
          return (!build.building && (build.result !== 'SUCCESS'));
        });

        const title = 'Jenkins Builds';
        const subTitle = `Total ${allBuilds.length}, Active ${activeBuilds.length}, Success ${successBuilds.length}, Failed ${failedBuilds.length}`;
        const points = [];
        points.push(activeBuilds.length);
        const values = [];
        values.push({
          raw: activeBuilds.length,
          label: 'Running',
        });
        values.push({
          raw: successBuilds.length,
          formatted: `<span style="color:green;">${successBuilds.length}</span>`,
          label: 'Success',
        });
        values.push({
          raw: failedBuilds.length,
          formatted: `<span style="color:red;">${failedBuilds.length}</span>`,
          label: 'Failed',
        });
        const table = {
          header: [],
          body: [],
        };
        table.header = [
          'Number',
          'Status',
          'Name',
          'Started',
          'Est Finish',
          'Duration',
          'Console output',
          'Status page',
        ];
        allBuilds.map((build) => {
          let duration = build.duration / 1000 / 60;
          table.body.push([
            build.number,
            this.formatStatusName(build.status),
            build.displayName,
            this.formatDate(build.timestamp),
            (build.building ? this.formatDate(build.timestamp + build.estimatedDuration) : ''),
            (build.building ? '' : `${duration.toFixed()} Min`),
            `<a href="${this.apiUrl}${build.id}/console" target="_blank">Console output</a>`,
            `<a href="${this.apiUrl}${build.id}" target="_blank">Status page</a>`,
          ]);
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

module.exports = JenkinsMetric;
