const colors = require('colors');
const uuid   = require('uuid');
const os     = require('os');

const SensorHubConnector = require(__dirname + '/SensorHubConnector.js');

class MonitoringSensor {

  constructor(config) {
    const _this = this;

    _this.sensorConfig = Object.assign({ hubUrl: 'http://localhost:8082', name: os.hostname() }, config);

    _this.sensorUid   = uuid.v4();
    _this.sensorName  = _this.sensorConfig.name;
    _this.metrics     = [];
    _this.metricsList = [];
  }

  log(message, attributes, isError) {
    const logTag = 'SNS';
    let text = colors.yellow(`[${logTag}]`);
    if (isError) {
      text += ' ' + colors.yellow(`[ERROR]`);
    }
    text += ' ' + message;
    if (attributes) {
      text += ' ' + colors.green(JSON.stringify(attributes));
    }
    console.log(text);
  }

  getInfo() {
    return {
        sensorUid: this.sensorUid
      , sensorName: this.sensorName
    };
  }

  start() {
    const _this = this;

    _this.log('Starting sensor', { sensorUid: _this.sensorUid });

    function gatherAndSendData(metric, metricDescriptor) {
      try {
        metric.getData().then(function(metricData) {
          sensorHubConnector.sendData(metricDescriptor.metricInfo.metricUid, metricData);
        });
      } catch (error) {
        _this.log(error, metricDescriptor.metrictInfo, true);
      }
    }

    function registerMetric(metricDescriptor) {
      _this.log('Registering metric', metricDescriptor);
      sensorHubConnector.registerMetric(metricDescriptor);
    }

    _this.sensorConfig.metrics.map(async function(metricConfig) {
      let Metric = require(`${__dirname}/${metricConfig.name}Metric.js`);
      let metric = new Metric(_this.sensorConfig, metricConfig);
      let metrinConfig = await metric.getConfig();
      let metricDescriptor = {
          sensorInfo: _this.getInfo()
        , metricInfo: await metric.getInfo()
        , metricConfig: await metric.getConfig()
      };
      _this.metrics.push({
          metric: metric
        , metricDescriptor: metricDescriptor
      });
      _this.log('Metric started', metricDescriptor);
      registerMetric(metricDescriptor);
      setInterval(function() {
        gatherAndSendData(metric, metricDescriptor);
      }, metric.refreshInterval);
    });

    _this.log(`Connecting to hub at ${_this.sensorConfig.hubUrl}`);

    const sensorHubConnector = new SensorHubConnector(_this.sensorConfig.hubUrl);

    sensorHubConnector.on('connect', function() {
      _this.log(`Connected to hub at ${_this.sensorConfig.hubUrl}`);
      _this.metrics.map(function(metric) {
        registerMetric(metric.metricDescriptor);
      });
    });

    sensorHubConnector.on('metricRegistered', function(data) {
      _this.metrics.map(function(metric) {
        if (metric.metricDescriptor.metricInfo.metricUid == data.metricInfo.metricUid) {
          _this.log('Metric registration acknowledged', metric.metricDescriptor);
          gatherAndSendData(metric.metric, metric.metricDescriptor);
        }
      });
    });

    sensorHubConnector.on('disconnect', function() {
      _this.log(`Disconnected from hub at ${_this.sensorConfig.hubUrl}`);
    });
  }

}

module.exports = MonitoringSensor;
