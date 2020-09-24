const MonitoringSensor    = require(__dirname + '/index.js');

const config = {
  sensor: {
    hubUrl: 'http://localhost:8082'
  , metrics: [
      { name: 'LA' }
    , { name: 'ProcessList' }
    ]
  }
};

const sensor    = new MonitoringSensor(config.sensor);

sensor.start();
