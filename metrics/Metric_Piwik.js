const uid = require('uuid');
const http = require('https');

module.exports.create = function(sensorConfig, metricConfig) {

  const _this = this;

  _this.sensorConfig = Object.assign({ }, sensorConfig);
  _this.metricConfig = Object.assign({ refreshInterval: 5000, rendererName: 'LineChart' }, metricConfig);

  _this.uid = uid.v4();

  const requestParams = {
      host: _this.metricConfig.api_server
    , port: 443
    , path: `/index.php?module=API&method=Live.getCounters&token_auth=${_this.metricConfig.token_auth}&idSite=${_this.metricConfig.idSite}&lastMinutes=1&format=JSON`
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
    return 'Piwik';
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
        const title = 'Online Users / Piwik (' + _this.sensorConfig.name + ')';
        let subTitle, value, label;
        if (data.length > 0) {
          label    = `${data[0].visits} online visitor(s)`;
          value    = data[0].visits;
          subTitle = `${data[0].visits} online visitor(s)`;
        } else {
          value    = 0;
          subTitle = data.message;
        }
        callback.call(_this, { value: value
                             , label: label
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
