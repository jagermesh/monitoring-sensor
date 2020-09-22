const socketClient = require('socket.io-client');
const uid = require('uuid');
const os = require('os');

module.exports = function(config) {

  const _this = this;

  _this.config = Object.assign({ hubUrl: 'http://localhost:8082', name: os.hostname() }, config);

  _this.uid = uid.v4();

  _this.log = function(message) {
    console.log(`[SNS] ${message}`);
  };

  _this.error = function(message) {
    console.log(`[SNS] [ERROR] ${message}`);
  };

  _this.start = function() {

    // client

    _this.log('Starting sensor');

    let registered = false;

    let metricObjects = [];
    let metricsList = [];

    for (let i = 0; i < _this.config.metrics.length; i++) {
      try {
        (function(metricConfig) {
          _this.log(`Loading implementation for "${metricConfig.name}" metric with config:`);
          _this.log('   ' + JSON.stringify(metricConfig), 'SNS');
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
        _this.log('   OK', 'SNS');
      } catch (error) {
        _this.error('    Metric: ' + _this.config.metrics[i].name + ', Error: ' + error);
      }
    }

    const hubConnection = socketClient.connect(_this.config.hubUrl, { reconnect: true });

    hubConnection.on('connect', function() {
      _this.log(`Registering sensor "${_this.config.name}" on hub server`);
      hubConnection.emit( 'registerSensor', { sensorName:  _this.config.name
                                            , sensorUid:   _this.uid
                                            , metricsList: metricsList
                                            });
    });

    hubConnection.on('sensorRegistered', function(data) {
      _this.log(`Registration acknowledged for sensor "${data.sensorInfo.sensorName}"`);
      registered = true;
    });

    hubConnection.on('disconnect', function(a) {
      _this.log('Disconnected', 'SNS');
      registered = false;
    });

    for (let i = 0; i < metricObjects.length; i++) {
      (function(metricObj) {
        function work() {
          try {
            metricObj.getData(function(data) {
              if (hubConnection && registered) {
                if (hubConnection.connected) {
                  hubConnection.emit( 'sensorData'
                                    , { metricInfo: { uid:  metricObj.getUid()
                                                    // , name: metricObj.getName()
                                                    }
                                      , metricData: data
                                      ,
                                      }
                                    );
                }
              }
            });
          } catch (error) {
            _this.error('    Metric: ' + metricObj.getName() + ', Error: ' + error);
          }
        }
        work();
        setInterval(
          function() {
            work();
          }, metricObj.metricConfig.refreshInterval
        );
      })(metricObjects[i]);
    }

    _this.log(`Connected to hub at ${_this.config.hubUrl}`);

  };

  return _this;

};
