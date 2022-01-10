const uuid = require('uuid');
const os = require('os');

const SensorHubConnector = require(__dirname + '/SensorHubConnector.js');
const Logger = require(__dirname + '/Logger.js');

class MonitoringSensor {

  constructor(config, logger) {
    this.sensorConfig = Object.assign({
        hubUrl: 'http://localhost:8082',
        name: os.hostname()
      },
      config
    );

    this.sensorUid = uuid.v4();
    this.sensorName = this.sensorConfig.name;
    this.metrics = [];

    this.logger = (logger || new Logger('SNS'));
  }

  getInfo() {
    const _this = this;

    return {
      sensorUid: this.sensorUid,
      sensorName: this.sensorName,
    };
  }

  start() {
    const _this = this;

    _this.logger.log('Starting sensor', {
      sensorUid: _this.sensorUid
    });

    function gatherAndSendData(metric, metricDescriptor) {
      try {
        metric.getData().then(function(metricData) {
          sensorHubConnector.sendData(metricDescriptor.metricInfo.metricUid, metricData);
        }).catch(function(error) {
          _this.logger.log(error, metricDescriptor.metricInfo, true);
        });
      } catch (error) {
        _this.logger.log(error, metricDescriptor.metricInfo, true);
      }
    }

    function registerMetric(metricDescriptor) {
      _this.logger.log('Registering metric', metricDescriptor);
      sensorHubConnector.registerMetric(metricDescriptor);
    }

    _this.sensorConfig.metrics.map(async function(metricConfig) {
      let Metric = require(`${__dirname}/${metricConfig.name}Metric.js`);
      let metric = new Metric(_this.sensorConfig, metricConfig);
      let metricDescriptor = {
        sensorInfo: _this.getInfo(),
        metricInfo: await metric.getInfo(),
        metricConfig: await metric.getConfig(),
      };
      _this.metrics.push({
        metric: metric,
        metricDescriptor: metricDescriptor,
      });
      _this.logger.log('Metric started', metricDescriptor);
      registerMetric(metricDescriptor);
      setInterval(function() {
        gatherAndSendData(metric, metricDescriptor);
      }, metricDescriptor.metricInfo.metricRefreshInterval);
    });

    _this.logger.log(`Connecting to hub at ${_this.sensorConfig.hubUrl}`);

    const sensorHubConnector = new SensorHubConnector(_this.sensorConfig.hubUrl);

    sensorHubConnector.on('connect', function() {
      _this.logger.log(`Connected to hub at ${_this.sensorConfig.hubUrl}`);
      _this.metrics.map(function(metric) {
        registerMetric(metric.metricDescriptor);
      });
    });

    sensorHubConnector.on('metricRegistered', function(data) {
      _this.metrics.map(function(metric) {
        if (metric.metricDescriptor.metricInfo.metricUid === data.metricInfo.metricUid) {
          _this.logger.log('Metric registration acknowledged', metric.metricDescriptor);
          gatherAndSendData(metric.metric, metric.metricDescriptor);
        }
      });
    });

    sensorHubConnector.on('disconnect', function() {
      _this.logger.log(`Disconnected from hub at ${_this.sensorConfig.hubUrl}`);
    });
  }

}

module.exports = MonitoringSensor;