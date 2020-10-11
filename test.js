const { MonitoringSensor } = require(__dirname + '/index.js');

const config = {
  sensor: {
    hubUrl: 'http://localhost:8082'
  , metrics: [
      // CPU
      { name: 'CPU'
      , rendererName: 'Chart'
      },
      { name: 'CPU'
      , rendererName: 'Chart'
      , settings: {
          processes: 'php,node'
        }
      },
      { name: 'CPU'
      , rendererName: 'Value'
      },
      { name: 'CPU'
      , rendererName: 'Value'
      , settings: {
          processes: 'php,node'
        }
      },
      { name: 'CPU'
      , rendererName: 'Table'
      },
      { name: 'CPU'
      , rendererName: 'Table'
      , settings: {
          processes: 'php,node'
        }
      },
      { name: 'CPU'
      , rendererName: 'Gauge'
      },
      { name: 'CPU'
      , rendererName: 'Gauge'
      , settings: {
          processes: 'php,node'
        }
      },
      // RAM
      { name: 'RAM'
      , rendererName: 'Chart'
      },
      { name: 'RAM'
      , rendererName: 'Value'
      },
      { name: 'RAM'
      , rendererName: 'Table'
      },
      { name: 'RAM'
      , rendererName: 'Gauge'
      },
      // LA
      { name: 'LA'
      , rendererName: 'Chart'
      },
      { name: 'LA'
      , rendererName: 'Value'
      },
      { name: 'LA'
      , rendererName: 'Table'
      },
      { name: 'LA'
      , rendererName: 'Gauge'
      },
      // Processes
      { name: 'Processes'
      , rendererName: 'Chart'
      },
      { name: 'Processes'
      , rendererName: 'Value'
      },
      { name: 'Processes'
      , rendererName: 'Table'
      },
      { name: 'Processes'
      , rendererName: 'Chart'
      , settings: {
          processes: 'php,node'
        }
      },
      { name: 'Processes'
      , rendererName: 'Value'
      , settings: {
          processes: 'php,node'
        }
      },
      { name: 'Processes'
      , rendererName: 'Table'
      , settings: {
          processes: 'php,node'
        }
      },
      // HDD
      { name: 'HDD'
      , rendererName: 'Chart'
      },
      { name: 'HDD'
      , rendererName: 'Table'
      },
      { name: 'HDD'
      , rendererName: 'Value'
      },
      { name: 'HDD'
      , rendererName: 'Chart'
      , settings: {
          mounts: '/System/Volumes/Data'
        , threshold: 80
        }
      },
      { name: 'HDD'
      , rendererName: 'Table'
      , settings: {
          mounts: '/System/Volumes/Data'
        }
      },
      { name: 'HDD'
      , rendererName: 'Value'
      , settings: {
          mounts: '/System/Volumes/Data'
        }
      },
      // Jenkins
      { name: 'Jenkins'
      , rendererName: 'Chart'
      , settings: {
          apiUrl: 'http://localhost:8080/job/project/',
          username: 'admin',
          password: '11acff4a9f050afc3787c908c0812c3c8d',
        }
      },
      { name: 'Jenkins'
      , rendererName: 'Table'
      , settings: {
          apiUrl: 'http://localhost:8080/job/project/',
          username: 'admin',
          password: '11acff4a9f050afc3787c908c0812c3c8d',
        }
      },
      { name: 'Jenkins'
      , rendererName: 'Value'
      , settings: {
          apiUrl: 'http://localhost:8080/job/project/',
          username: 'admin',
          password: '11acff4a9f050afc3787c908c0812c3c8d',
        }
      },
      // MySQLProcesses
      { name: 'MySQLProcesses'
      , rendererName: 'Chart'
      , settings: {
          host: 'localhost'
        , user: 'root'
        , password: ''
        }
      },
      { name: 'MySQLProcesses'
      , rendererName: 'Table'
      , settings: {
          host: 'localhost'
        , user: 'root'
        , password: ''
        }
      },
      { name: 'MySQLProcesses'
      , rendererName: 'Value'
      , settings: {
          host: 'localhost'
        , user: 'root'
        , password: ''
        }
      },
      // MySQL
      { name: 'MySQL'
      , rendererName: 'Chart'
      , settings: {
          host: 'localhost',
          user: 'root',
          password: '',
          database: '',
          sql: 'SHOW PROCESSLIST',
          description: 'MySQL Process List'
        }
      },
      { name: 'MySQL'
      , rendererName: 'Table'
      , settings: {
          host: 'localhost',
          user: 'root',
          password: '',
          database: '',
          sql: 'SHOW PROCESSLIST',
          description: 'MySQL Process List'
        }
      },
      { name: 'MySQL'
      , rendererName: 'Value'
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
