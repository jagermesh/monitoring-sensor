const colors       = require('colors');
const socketClient = require('socket.io-client');
const uid          = require('uuid');
const os           = require('os');

module.exports = function(config) {

  const _this = this;

  _this.config = Object.assign({ hubUrl: 'http://localhost:8082', name: os.hostname() }, config);

  _this.uid = uid.v4();

  let logTag = 'SNS';

  _this.log = function(message, attributes) {
    let text = colors.yellow(`[${logTag}]`) + ' ' + message;
    if (attributes) {
      text += ' ' + colors.green(JSON.stringify(attributes));
    }
    console.log(text);
  };

  _this.error = function(message, attributes) {
    let text = colors.yellow(`[${logTag}]`) + ' ' + colors.yellow(`[ERROR]`) + ' ' + message;
    if (attributes) {
      text += ' ' + colors.green(JSON.stringify(attributes));
    }
    console.log(text);
  };

  _this.start = function() {

    // client

    _this.log('Starting sensor', { sensorUid: _this.uid });

    let registered = false;
    let started    = false;

    let metricObjects = [];
    let metricsList   = [];

    _this.config.metrics.map(function(metricConfig) {
      try {
        let metricImpl = require(`${__dirname}/metrics/Metric_${metricConfig.name}.js`);
        let metricObj = new metricImpl.create(_this.config, metricConfig);
        metricObj.init();
        metricObjects.push(metricObj);
        let metricInfo = { uid:          metricObj.getUid()
                         , name:         metricObj.getName()
                         , rendererName: metricObj.getRendererName()
                         , metricConfig: metricObj.getHarmlessConfig()
                         };
        metricsList.push(metricInfo);
        _this.log('Metric started', { sensorUid: _this.uid, metricUid: metricInfo.uid, name: metricInfo.name });
      } catch (error) {
        _this.error(`Metric: ${metricConfig.name}, Error: ${error}`);
      }
    });

    _this.log(`Connecting to hub at ${_this.config.hubUrl}`);

    const hubConnection = socketClient.connect(_this.config.hubUrl, { reconnect: true });

    hubConnection.on('connect', function() {
      _this.log('Connected to hub');
      _this.log('Registering sensor', { sensorUid:   _this.uid });
      hubConnection.emit( 'registerSensor', { sensorUid:   _this.uid
                                            , sensorName:  _this.config.name
                                            , metricsList: metricsList
                                            });
    });

    hubConnection.on('sensorRegistered', function(data) {
      _this.log('Sensor registration acknowledged', { sensorUid: _this.uid });
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
        _this.error(`Metric: ${metricObj.getName()}, Error: ${error}`);
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
