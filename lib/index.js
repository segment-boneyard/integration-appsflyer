
/**
 * Module depedencies
 */

var fmt = require('util').format;
var integration = require('segmentio-integration');

/**
 * Expose `AppsFlyer`
 */

var AppsFlyer = module.exports = integration('AppsFlyer')
  .channels(['server', 'mobile', 'client'])
  .ensure('settings.appsFlyerDevKey')
  .endpoint('https://api2.appsflyer.com/inappevent/')
  .retries(2);

/**
 * Conditionally ensure settings based on ios/android
 */

AppsFlyer.ensure(function(msg) {
  var library = msg.library(); // { name: <library-name> version: <library-version> }
  if (contains(library.name, 'ios') && !this.settings.appleAppID) {
    return this.invalid('iOS apps must send the Apple App ID');
  }
});

/**
 * Check which library the message is from
 *
 * @api private
 * @params {string} library.name
 * @params {string} str
 * return true/false
 */

function contains(libraryName, str) {
  return libraryName.toLowerCase().indexOf(str) !== -1;
}
