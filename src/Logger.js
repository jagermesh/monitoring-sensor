const colors = require('colors');

class Logger {
  constructor(tag) {
    this.tag = tag || 'SNS';
  }

  log(message, attributes, isError) {
    let text = colors.yellow(`[${this.tag}]`);
    if (isError) {
      text += ` ${colors.red('[ERROR]')}`;
    }
    text += ` ${message}`;
    if (attributes) {
      text += ` ${colors.green(JSON.stringify(attributes))}`;
    }
    console.log(text);
  }
}

module.exports = Logger;
