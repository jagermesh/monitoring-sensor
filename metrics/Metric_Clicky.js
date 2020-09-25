const http = require('http');
const uid  = require('uuid');

module.exports.create = function(sensorConfig, metricConfig) {

  const _this = this;

  _this.sensorConfig = Object.assign({ }, sensorConfig);
  _this.metricConfig = Object.assign({ refreshInterval: 5000, rendererName: 'LineChart' }, metricConfig);

  _this.uid = uid.v4();

  const requestParams = {
      host: 'api.clicky.com'
    , port: 80
    , path: `/api/stats/4?site_id=${_this.metricConfig.site_id}&sitekey=${_this.metricConfig.sitekey}&type=visitors-online&output=json`
    , method: 'GET'
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
    return 'Clicky';
  };

  _this.getHarmlessConfig = function() {
    const config = Object.create({ });
    config.lineColor = 'green';
    config.fillColor = 'lightgreen';
    config.website   = _this.metricConfig.website;
    return config;
  };

  _this.getData = function(callback) {
    const req = http.request(requestParams, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        const data = JSON.parse(chunk);
        const title    = `Online Users / Clicky (${_this.sensorConfig.name})`;
        const subTitle = `${data[0].dates[0].items[0].value} online visitor(s)`;
        const label    = `${data[0].dates[0].items[0].value} online visitor(s)`;
        const value    = data[0].dates[0].items[0].value;
        callback.call(_this, { label: label
                             , value: value
                             , title: title
                             , subTitle: subTitle
                             });
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
