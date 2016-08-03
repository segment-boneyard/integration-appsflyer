
/**
 * Module depedencies
 */

var fmt = require('util').format;
var integration = require('segmentio-integration');

/**
 * Expose `AppsFlyer`
 */

var AppsFlyer = module.exports = integration('AppsFlyer')
  .channels(['server', 'mobile']) // TODO: what about client?
  .ensure('settings.appsFlyerDevKey')
  .endpoint('https://api2.appsflyer.com/inappevent/')
  .retries(2);

/**
 * Conditionally ensure settings based on ios/android
 */

AppsFlyer.ensure(function(msg, settings) {
  if (contains(msg.library(), 'ios') && !settings.appleAppID) {
    return this.invalid('iOS apps must send the Apple App ID');
  }

  var integrationOptions = msg.options('AppsFlyer');
  if (!integrationOptions.appsFlyerId) return this.invalid('AppsFlyer Device ID is required');
});

/**
 * Send server side events
 *
 * https://support.appsflyer.com/hc/en-us/articles/207034486-Server-to-Server-In-App-Events-API-HTTP-API-
 * @param {Object} track
 * @param {Function} cb
 * @api private
 */

AppsFlyer.prototype.track = function(track, fn) {
  // *NOTE*: everything in the payload should be stringified
  // Since our ensure block ensures this to be available
  var endpoint = selectEndpoint(track.library(), this.settings);
  var options = track.options('AppsFlyer');
  var device = track.device() || {};
  var revenue = track.revenue(); // will use properties.total for `order completed` events
  // needs to be in UTC timezone i.e. "2016-08-03 12:17:00.000
  var timestamp = track.timestamp().toISOString().replace(/T/, ' ').slice(0, -1);
  var payload = {
    appsflyer_id: options.appsFlyerId,
    eventName: track.event(),
    eventValue: {},
    eventCurrency: track.currency(), // defaults to 'USD'
    ip: track.ip(),
    eventTime: timestamp,
    af_events_api: "true"
  };

  // This object can be anything, revisit possibly adding more props here
  // AppsFlyer lets you send empty event value
  revenue ? payload.eventValue.revenue = revenue.toString() : payload.eventValue = '';

  if (contains(track.library(), 'ios')) {
    payload.idfa = device.advertisingId.toString();
    payload.bundle_id = track.proxy('context.app.namespace');
  } else {
    payload.advertising_id = device.advertisingId.toString();
  }

  return this
    .post(endpoint)
    .type('json')
    .set('authentication', this.settings.appsFlyerDevKey)
    .send(payload)
    .end(this.handle(fn));
};

/**
 * Check which library the message is from
 *
 * @api private
 * @param {Object} library
 * @param {String} str
 * return true/false
 */

function contains(library, str) {
  var name = typeof library === 'string' ? library : library.name;
  return name.toLowerCase().indexOf(str) !== -1;
}

/**
 * Get the correct endpoint based on library
 *
 * @api private
 * @param {Object} library
 * @return {String} endpoint
 */

function selectEndpoint(library, settings) {
  var endpoint;
  if (contains(library, 'ios')) {
    // appsflyer wants ios to always have 'id' prefixed
    endpoint = 'id' + settings.appleAppID;
  } else {
    endpoint = settings.androidAppID;
  }
  return endpoint;
}
