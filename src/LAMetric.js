const os = require('os');

const CustomMetric = require(__dirname + '/CustomMetric.js');

class LAMetric extends CustomMetric {
  constructor(sensorConfig, metricConfig) {
    metricConfig.rendererName = metricConfig.rendererName || 'Chart';
    metricConfig.refreshInterval = metricConfig.refreshInterval || 3000;

    super(sensorConfig, metricConfig);

    this.cpus = os.cpus().length;
    this.critical = this.cpus * 0.75;
    this.overload = this.cpus;
  }

  getConfig() {
    return new Promise((resolve) => {
      const config = Object.create({});
      config.lineColor = 'green';
      config.suggestedMax = this.overload;
      config.min = 0;
      config.datasets = [];
      config.datasets.push('LA 1 Min');
      config.datasets.push('LA 5 Min');
      config.datasets.push('LA 15 Min');
      config.ranges = [];
      config.ranges.push({
        value: this.critical,
        title: `Critical (>${this.critical.toFixed(2)})`,
        lineColor: 'chocolate',
      });
      config.ranges.push({
        value: this.overload,
        title: `Overload (>${this.overload.toFixed(2)})`,
        lineColor: 'red',
      });
      resolve(config);
    });
  }

  writeValue(value) {
    let message = '<b';
    if (value > this.overload) {
      message += ' style="color:red;"';
    } else if (value > this.critical) {
      message += ' style="color:orange;"';
    }
    message += `>${value.toFixed(2)}</b>`;
    return message;
  }

  getData() {
    return new Promise((resolve) => {
      const la = os.loadavg();
      const title = `LA ${this.cpus} CPUs`;
      const subTitle = `${this.writeValue(la[0])} · ${this.writeValue(la[1])} · ${this.writeValue(la[2])}`;
      const table = {
        header: [],
        body: [],
      };
      table.body.push(['LA 1 Min', la[0].toFixed(2)]);
      table.body.push(['LA 5 Min', la[1].toFixed(2)]);
      table.body.push(['LA 15 Min', la[2].toFixed(2)]);
      const points = [];
      points.push(la[0]);
      points.push(la[1]);
      points.push(la[2]);
      const values = [];
      values.push({
        raw: la[0],
        threshold: la[0],
        formatted: la[0].toFixed(2),
        label: 'LA 1 Min',
      });
      values.push({
        raw: la[1],
        threshold: la[1],
        formatted: la[1].toFixed(2),
        label: 'LA 5 Min',
      });
      values.push({
        raw: la[2],
        threshold: la[2],
        formatted: la[2].toFixed(2),
        label: 'LA 15 Min',
      });
      resolve({
        title: title,
        subTitle: subTitle,
        values: values,
        points: points,
        table: table,
      });
    });
  }
}

module.exports = LAMetric;
