const SensorHubConnector = require(__dirname + '/libs/SensorHubConnector.js');
const MonitoringSensor = require(__dirname + '/libs/MonitoringSensor.js');
// metrics
const CPUMetric = require(__dirname + '/libs/CPUMetric.js');
const HDDMetric = require(__dirname + '/libs/HDDMetric.js');
const LAMetric = require(__dirname + '/libs/LAMetric.js');
const RAMMetric = require(__dirname + '/libs/RAMMetric.js');
const MySQLProcessesMetric = require(__dirname + '/libs/MySQLProcessesMetric.js');
const ProcessesMetric = require(__dirname + '/libs/ProcessesMetric.js');

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
