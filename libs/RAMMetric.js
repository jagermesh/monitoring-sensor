const bytes = require('bytes');
const si    = require('systeminformation');

const CustomMetric = require(__dirname + '/CustomMetric.js');

class RAMMetric extends CustomMetric {

  constructor(sensorConfig, metricConfig) {
    super(sensorConfig, metricConfig);

    this.rendererName    = this.rendererName || 'Chart';
    this.refreshInterval = this.refreshInterval || 3000;
    this.multiplier      = 1;
  }

  getConfig() {
    const _this = this;

    return new Promise(function(resolve, reject) {
      si.mem().then(function (stats) {
        let tmp = stats.total;
        _this.multiplier = 1;
        while(tmp > 1024) {
          tmp = tmp/1024;
          _this.multiplier = _this.multiplier * 1024;
        }
        let rawTotal = stats.total;
        let total = rawTotal/_this.multiplier;
        const overload = total * 0.75;
        const critical = total * 0.90;
        const config = Object.create({ });
        config.lineColor = 'green';
        config.suggestedMax = total;
        config.min = 0;
        config.datasets = [];
        config.datasets.push('Active');
        config.ranges = [];
        config.ranges.push({
            value:     overload
          , title:     `Overload (>${bytes(overload)})`
          , lineColor: 'chocolate'
        });
        config.ranges.push({
            value:     critical
          , title:     `Critical (>${bytes(critical)})`
          , lineColor: 'red'
        });
        resolve(config);
      });
    });
  }

  getData() {
    const _this = this;

    return new Promise(function(resolve, reject) {
      si.mem().then(function (stats) {
        const rawTotal     = stats.total;
        const rawActive    = stats.active;
        const rawAvailable = stats.available;
        const total        = rawTotal/_this.multiplier;
        const active       = rawActive/_this.multiplier;
        const available    = rawAvailable/_this.multiplier;
        const title        = `RAM`;
        const subTitle     = `Active ${bytes(rawActive)}, Total ${bytes(rawTotal)}, Available ${bytes(rawAvailable)}`;
        const value        = active.toFixed(2);
        const table = {
            header: []
          , body:   []
        };
        table.body.push(['Active', bytes(rawActive)]);
        table.body.push(['Total', bytes(rawTotal)]);
        table.body.push(['Available', bytes(rawAvailable)]);
        const points = [];
        points.push(active);
        const values = [];
        values.push({ raw: rawActive, threshold: active, formatted: bytes(rawActive), label: 'Active'});
        values.push({ raw: rawAvailable, formatted: bytes(rawAvailable), label: 'Available'});
        values.push({ raw: rawTotal, formatted: bytes(rawTotal), label: 'Total'});
        resolve({
          title:     title,
          subTitle:  subTitle,
          values:    values,
          points:    points,
          table:     table,
        });
      });
    });
  }

}

module.exports = RAMMetric;
