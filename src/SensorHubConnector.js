const socketClient = require('socket.io-client');
const EventEmitter = require('events');

class SensorHubConnector extends EventEmitter {
  constructor(hubUrl) {
    super();

    const _this = this;

    _this.hubUrl = hubUrl || 'http://localhost:8082';

    _this.connection = socketClient.connect(_this.hubUrl, {
      reconnect: true
    });

    _this.connection.on('connect', function() {
      _this.emit('connect');
    });

    _this.connection.on('metricRegistered', function(data) {
      _this.emit('metricRegistered', data);
    });

    _this.connection.on('disconnect', function() {
      _this.emit('disconnect');
    });
  }

  sendData(metricUid, metricData) {
    const _this = this;

    if (_this.connection) {
      if (_this.connection.connected) {
        let message = {
          metricUid: metricUid,
          metricData: metricData,
        };
        _this.connection.emit('metricData', message);
      }
    }
  }

  registerMetric(struct) {
    const _this = this;

    if (_this.connection) {
      if (_this.connection.connected) {
        _this.connection.emit('registerMetric', struct);
      }
    }
  }
}

module.exports = SensorHubConnector;
