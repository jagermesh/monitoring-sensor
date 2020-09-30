module.exports = {
  hubUrl: 'http://localhost:8082'
, metrics: [
    { name: 'CPU'
    , refreshInterval: 1000
    }
  , { name: 'CPU'
    , refreshInterval: 1000
    , setings: {
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
        host: '[host]'
      , user: '[user]'
      , password: '[password]'
      }
    }
  , { name: 'PHPProcessList'
    , refreshInterval: 5000
    }
  , { name: 'ProcessCount'
    , refreshInterval: 5000
    }
  , { name: 'ProcessList'
    , refreshInterval: 5000
    , settings: {
        mask: 'php'
      }
    }
  ]
};
