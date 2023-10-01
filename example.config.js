module.exports = {
  hubUrl: 'http://localhost:8082',
  metrics: [{
    name: 'CPU',
    refreshInterval: 1000,
  }, {
    name: 'RAM',
    refreshInterval: 1000,
  }, {
    name: 'HDD',
    refreshInterval: 5000,
    settings: {
      path: '/',
    },
  }, {
    name: 'LA',
    refreshInterval: 1000,
  }, {
    name: 'MySQLProcesses',
    refreshInterval: 5000,
    settings: {
      host: '[host]',
      user: '[user]',
      password: '[password]',
    },
  }, {
    name: 'Processes',
    refreshInterval: 5000,
  } ],
};