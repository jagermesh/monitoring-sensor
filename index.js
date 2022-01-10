const SensorHubConnector = require(`${__dirname}/src/SensorHubConnector.js`);
const MonitoringSensor = require(`${__dirname}/src/MonitoringSensor.js`);
// metrics
const CPUMetric = require(`${__dirname}/src/CPUMetric.js`);
const HDDMetric = require(`${__dirname}/src/HDDMetric.js`);
const LAMetric = require(`${__dirname}/src/LAMetric.js`);
const RAMMetric = require(`${__dirname}/src/RAMMetric.js`);
const MySQLProcessesMetric = require(`${__dirname}/src/MySQLProcessesMetric.js`);
const ProcessesMetric = require(`${__dirname}/src/ProcessesMetric.js`);

module.exports = {
  MonitoringSensor: MonitoringSensor,
  SensorHubConnector: SensorHubConnector,
  // metrics
  CPUMetric: CPUMetric,
  HDDMetric: HDDMetric,
  LAMetric: LAMetric,
  RAMMetric: RAMMetric,
  MySQLProcessesMetric: MySQLProcessesMetric,
  ProcessesMetric: ProcessesMetric,
};