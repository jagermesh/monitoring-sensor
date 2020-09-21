module.exports = {
    serverName: 'dummy'
  , hubUrl: 'http://localhost:8082'
  , metrics: [
       { name: 'LA'
       , refreshInterval: 1000
       }
     , { name: 'MySQLProcessList'
       , refreshInterval: 5000
       , settings: { host:     '[hostname]'
                   , user:     '[username]'
                   , password: '[password]'
                   }
       }
     , { name: 'HDDFreeSpace'
       , refreshInterval: 5000
       , path: '/'
       , threshold: 80
       }
     , { name: 'PHPProcessList'
       , refreshInterval: 5000
       }
     , { name: 'ProcessList'
       , refreshInterval: 5000
       , mask: 'php'
       }
    ]
};
