const socketClient = require('socket.io-client');
const EventEmitter = require('events');

class SensorHubConnector extends EventEmitter {
  constructor(hubUrl) {
    super();

    this.hubUrl = hubUrl || 'http://localhost:8082';

    this.connection = socketClient.connect(this.hubUrl, {
      reconnect: true,
    });

    this.connection.on('connect', () => {
      this.emit('connect');
    });

    this.connection.on('metricRegistered', (data) => {
      this.emit('metricRegistered', data);
    });

    this.connection.on('disconnect', () => {
      this.emit('disconnect');
    });
  }

  sendData(metricUid, metricData) {
    if (this.connection) {
      if (this.connection.connected) {
        let message = {
          metricUid: metricUid,
          metricData: metricData,
        };
        this.connection.emit('metricData', message);
      }
    }
  }

  registerMetric(struct) {
    if (this.connection) {
      if (this.connection.connected) {
        this.connection.emit('registerMetric', struct);
      }
    }
  }
}

module.exports = SensorHubConnector;
