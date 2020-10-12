const { MonitoringSensor } = require(__dirname + '/index.js');

const config = {
  sensor: {
    hubUrl: 'http://localhost:8082'
  , metrics: [
      // CPU
      { name: 'CPU'
      , rendererName: 'Chart,Value,Table,Gauge'
      },
      { name: 'CPU'
      , rendererName: 'Chart,Value,Table,Gauge'
      , settings: {
          processes: 'php,node'
        }
      },
      // RAM
      { name: 'RAM'
      , rendererName: 'Chart,Value,Table,Gauge'
      },
      // LA
      { name: 'LA'
      , rendererName: 'Chart,Value,Table,Gauge'
      },
      // Processes
      { name: 'Processes'
      , rendererName: 'Chart,Value,Table'
      },
      { name: 'Processes'
      , rendererName: 'Chart,Value,Table'
      , settings: {
          processes: 'php,node'
        }
      },
      // HDD
      { name: 'HDD'
      , rendererName: 'Chart,Value,Table'
      },
      { name: 'HDD'
      , rendererName: 'Chart,Value,Table'
      , settings: {
          mounts: '/System/Volumes/Data'
        , threshold: 80
        }
      },
      // Jenkins
      { name: 'Jenkins'
      , rendererName: 'Chart,Value,Table'
      , settings: {
          apiUrl: 'http://localhost:8080/job/project/',
          username: 'admin',
          password: '11acff4a9f050afc3787c908c0812c3c8d',
        }
      },
      // MySQLProcesses
      { name: 'MySQLProcesses'
      , rendererName: 'Chart,Value,Table'
      , settings: {
          host: 'localhost'
        , user: 'root'
        , password: ''
        }
      },
      // MySQL
      { name: 'MySQL'
      , rendererName: 'Chart,Value,Table'
      , settings: {
          host: 'localhost',
          user: 'root',
          password: '',
          database: '',
          sql: 'SHOW PROCESSLIST',
          description: 'MySQL Process List'
        }
      },
    ]
  }
};

const sensor = new MonitoringSensor(config.sensor);

sensor.start();
