const colors       = require('colors');
const socketClient = require('socket.io-client');
const uid          = require('uuid');
const os           = require('os');

module.exports = function(config) {

  const _this = this;

  _this.config = Object.assign({ hubUrl: 'http://localhost:8082', name: os.hostname() }, config);

  _this.uid = uid.v4();

  let logTag = 'SNS';

  _this.log = function(message, tag) {
    tag = tag || logTag;
    console.log(colors.yellow(`[${tag}]`) + ' ' + message);
  };

  _this.error = function(message, tag) {
    tag = tag || logTag;
    console.log(colors.yellow(`[${tag}]`) + ' ' + colors.red('[HUB]') + ' ' + message);
  };

  _this.start = function() {

    // client

    _this.log('Starting sensor');

    let registered = false;
    let started    = false;

    let metricObjects = [];
    let metricsList   = [];

    for (let i = 0; i < _this.config.metrics.length; i++) {
      try {
        (function(metricConfig) {
          let metricImpl = require(`${__dirname}/metrics/Metric_${metricConfig.name}.js`);
          let metricObj = new metricImpl.create(_this.config, metricConfig);
          metricObj.init();
          metricObjects.push(metricObj);
          metricsList.push({ uid:          metricObj.getUid()
                           , name:         metricObj.getName()
                           , rendererName: metricObj.getRendererName()
                           , metricConfig: metricObj.getHarmlessConfig()
                           });
        })(_this.config.metrics[i]);
      } catch (error) {
        _this.error(`Metric: ${_this.config.metrics[i].name}, Error: ${error}`);
      }
    }

    _this.log(`Connecting to hub at ${_this.config.hubUrl}`);

    const hubConnection = socketClient.connect(_this.config.hubUrl, { reconnect: true });

    hubConnection.on('connect', function() {
      _this.log('Connected to hub');
      _this.log(`Registering sensor "${_this.config.name}"`);
      hubConnection.emit( 'registerSensor', { sensorUid:   _this.uid
                                            , sensorName:  _this.config.name
                                            , metricsList: metricsList
                                            });
    });

    hubConnection.on('sensorRegistered', function(data) {
      _this.log(`Registration acknowledged for sensor "${data.sensorInfo.sensorName}"`);
      registered = true;
      start();
      gatherAndSendAllData();
    });

    hubConnection.on('disconnect', function(a) {
      _this.log('Disconnected from hub');
      registered = false;
    });

    function sendData(data) {
      if (hubConnection) {
        if (hubConnection.connected) {
          if (registered) {
            hubConnection.emit( 'sensorData'
                              , data
                              );
          }
        }
      }
    }

    function gatherAndSendData(metricObj) {
      try {
        metricObj.getData(function(data) {
          sendData({ sensorUid:  _this.uid
                   , metricUid:  metricObj.getUid()
                   , metricData: data
                   });
        });
      } catch (error) {
        _this.error('    Metric: ' + metricObj.getName() + ', Error: ' + error);
      }
    }

    function gatherAndSendAllData() {
      metricObjects.map(function (metricObj) {
        gatherAndSendData(metricObj);
      });
    }

    function start() {
      if (started) {
        return;
      }
      started = true;
      metricObjects.map(function (metricObj) {
        setInterval(function() { gatherAndSendData(metricObj); }, metricObj.metricConfig.refreshInterval);
      });
    }

  };

  return _this;

};
