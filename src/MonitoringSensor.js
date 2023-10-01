const uuid = require('uuid');
const os = require('os');

const SensorHubConnector = require(__dirname + '/SensorHubConnector.js');
const Logger = require(__dirname + '/Logger.js');

class MonitoringSensor {
  constructor(config, logger) {
    this.sensorConfig = Object.assign({
      hubUrl: 'http://localhost:8082',
      name: os.hostname(),
    },
    config,
    );

    this.sensorUid = uuid.v4();
    this.sensorName = this.sensorConfig.name;
    this.metrics = [];
    this.sensorHubConnector = null;

    this.logger = (logger || new Logger('SNS'));
  }

  getInfo() {
    return {
      sensorUid: this.sensorUid,
      sensorName: this.sensorName,
    };
  }

  gatherAndSendData(metric, metricDescriptor) {
    try {
      metric.getData().then((metricData) => {
        this.sensorHubConnector.sendData(metricDescriptor.metricInfo.metricUid, metricData);
      }).catch((error) => {
        this.logger.log(error, metricDescriptor.metricInfo, true);
      });
    } catch (error) {
      this.logger.log(error, metricDescriptor.metricInfo, true);
    }
  }

  registerMetric(metricDescriptor) {
    this.logger.log('Registering metric', metricDescriptor);
    this.sensorHubConnector.registerMetric(metricDescriptor);
  }

  start() {
    this.logger.log('Starting sensor', {
      sensorUid: this.sensorUid,
    });


    this.sensorConfig.metrics.map(async (metricConfig) => {
      let Metric = require(`${__dirname}/${metricConfig.name}Metric.js`);
      let metric = new Metric(this.sensorConfig, metricConfig);
      let metricDescriptor = {
        sensorInfo: this.getInfo(),
        metricInfo: await metric.getInfo(),
        metricConfig: await metric.getConfig(),
      };
      this.metrics.push({
        metric: metric,
        metricDescriptor: metricDescriptor,
      });
      this.logger.log('Metric started', metricDescriptor);
      this.registerMetric(metricDescriptor);
      setInterval(() => {
        this.gatherAndSendData(metric, metricDescriptor);
      }, metricDescriptor.metricInfo.metricRefreshInterval);
    });

    this.logger.log(`Connecting to hub at ${this.sensorConfig.hubUrl}`);

    this.sensorHubConnector = new SensorHubConnector(this.sensorConfig.hubUrl);

    this.sensorHubConnector.on('connect', () => {
      this.logger.log(`Connected to hub at ${this.sensorConfig.hubUrl}`);
      this.metrics.map((metric) => {
        this.registerMetric(metric.metricDescriptor);
      });
    });

    this.sensorHubConnector.on('metricRegistered', (data) => {
      this.metrics.map((metric) => {
        if (metric.metricDescriptor.metricInfo.metricUid === data.metricInfo.metricUid) {
          this.logger.log('Metric registration acknowledged', metric.metricDescriptor);
          this.gatherAndSendData(metric.metric, metric.metricDescriptor);
        }
      });
    });

    this.sensorHubConnector.on('disconnect', () => {
      this.logger.log(`Disconnected from hub at ${this.sensorConfig.hubUrl}`);
    });
  }
}

module.exports = MonitoringSensor;
