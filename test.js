const MonitoringSensor    = require(__dirname + '/index.js');

const config = {
  sensor: {
    hubUrl: 'http://localhost:8082'
  , metrics: [
      { name: 'CPU'
      , refreshInterval: 1000
      }
    , { name: 'CPU'
      , refreshInterval: 1000
      , settings: {
          processes: 'kernel_task,WindowServer'
        }
      }
    , { name: 'HDDFreeSpace'
      , refreshInterval: 5000
      , settings: {
          path: '/'
        , threshold: 80
        }
      }
    , { name: 'LA'
      , refreshInterval: 1000
      }
    , { name: 'MySQLProcessList'
      , refreshInterval: 5000
      , settings: {
          host: 'localhost'
        , user: 'root'
        , password: ''
        }
      }
    , { name: 'Processes'
      , refreshInterval: 5000
      }
    , { name: 'Processes'
      , refreshInterval: 5000
      , settings: {
          processes: 'php'
        }
      }
    , { name: 'Processes'
      , rendererName: 'Table'
      , refreshInterval: 5000
      }
    , { name: 'Processes'
      , rendererName: 'Table'
      , refreshInterval: 5000
      , settings: {
          processes: 'php'
        }
      }
    ]
  }
};

const sensor = new MonitoringSensor(config.sensor);

sensor.start();
