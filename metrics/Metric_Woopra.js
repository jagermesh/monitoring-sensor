const uid = require('uuid');
const http = require('http');

module.exports.create = function(sensorConfig, metricConfig) {

  const _this = this;

  _this.sensorConfig = Object.assign({ }, sensorConfig);
  _this.metricConfig = Object.assign({ refreshInterval: 5000, rendererName: 'LineChart' }, metricConfig);

  _this.uid = uid.v4();

  const authToken = new Buffer(`${_this.metricConfig.appID}:${_this.metricConfig.secretKey}`).toString('base64');

  const requestParams = {
      host: 'www.woopra.com'
    , port: 80
    , path: '/rest/2.2/online/count'
    , method: 'POST'
    , headers: {
        'Authorization': `Basic ${authToken}`
      }
  };

  _this.init = function () {

  };

  _this.getUid = function () {
    return _this.uid;
  };

  _this.getRendererName = function() {
    return _this.metricConfig.rendererName;
  };

  _this.getName = function() {
    return 'Woopra';
  };

  _this.getHarmlessConfig = function() {
    const config = Object.create({ });
    config.lineColor = 'green';
    config.fillColor = 'lightgreen';
    config.website = _this.metricConfig.website;
    return config;
  };

  _this.getData = function(callback) {
    const req = http.request(requestParams, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        const data = JSON.parse(chunk);
        const title = 'Online Users / Woopra (' + _this.sensorConfig.name + ')';
        let subTitle, value, label;
        if (data.count) {
          subTitle = `${data.count} online visitors(s)`;
          label = `${data.count} online visitors(s)`;
          value = data.count;
        } else {
          subTitle = data.description;
          value = 0;
        }
        callback.call(_this, { value: 0, title: title, subTitle: subTitle });
      });
    });
    req.on('error', function(e) {
      console.log(`[${_this.getName()}] Error: ${e.message}`);
    });
    req.write(`{"website": "${_this.metricConfig.website}"}\n`);
    req.end();
  };

  return _this;

};
