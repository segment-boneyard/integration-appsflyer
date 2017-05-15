'use strict';

/**
 * Module depedencies
 */

var integration = require('segmentio-integration');
var reject = require('reject');

/**
 * Expose `AppsFlyer`
 */

var AppsFlyer = module.exports = integration('AppsFlyer')
  .channels(['server'])
  .ensure('settings.appsFlyerDevKey')
  .endpoint('https://api2.appsflyer.com/inappevent/')
  .retries(2);

/**
 * Conditionally ensure settings based on ios/android
 */

AppsFlyer.ensure(function(msg, settings) {

  /**
  * Temporarily removing this check per: https://segment.zendesk.com/agent/tickets/73014.
  * Despite what their documentation says, AppsFlyer's API will accept events withtout an
  * advertisingId / idfa property. This ensure block was causing issues for customers
  * that have been using this integration without sending advertisingId previously.
  *
  * This is only applicable for customers that were sending us events from a server-side source
  * that had AppsFlyer enabled as an integration (ie. not via the bundled mobile integration).
  *
  * AppsFlyer will be working to migrate people away from doing this in the next couple of months.
  *
  * @ccnixon 05/10/2017

  // // Check to ensure message has advertisingId as a property of device object
  // var deviceInfo = msg.device() || {};
  // if (!deviceInfo.advertisingId) {
  //   return this.invalid('Events to AppsFlyer must specify an advertisingId as a contextual property of the device object');
  // }
  *
  **/

  // Check to ensure device type is either ios or android (case insensitive)
  var deviceType = getDeviceType(msg);
  if (deviceType !== 'ios' && deviceType !== 'android') {
    return this.reject('AppsFlyer integration is currently only supported for ios or android devices');
  }

  // Check to ensure settings contain an Apple App ID if device type is ios
  if (deviceType ==='ios' && !settings.appleAppID) {
    return this.invalid('iOS projects must configure the Apple App ID in the settings');
  }

  // Check to ensure settings containt an Android App ID if device type is android
  if (deviceType ==='android' && !settings.androidAppID) {
    return this.invalid('Android projects must configure the Android App ID in the settings to send server to server events');
  }

  var integrationOptions = msg.options('AppsFlyer');
  if (!integrationOptions.appsFlyerId) return this.invalid('AppsFlyer Device ID is required to send server to server events');
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
  /**
   * NOTE: These server side events will always be classified as "organic" events inside
   * AppsFlyer. There are two columns in the dashboard called "Unique Users" and "Average Actions per User"
   * Those two columns will be auto calculated by AF *only* for non-organic events so you cannot
   * get those to populate via server side.
   */

  // Since our ensure block ensures this to be available
  var deviceType = getDeviceType(track);
  var endpoint = selectEndpoint(deviceType, this.settings);
  var options = track.options('AppsFlyer');
  var device = track.device() || {};
  // needs to be in UTC timezone i.e. "2016-08-03 12:17:00.000
  var timestamp = track.timestamp().toISOString().replace(/T/, ' ').slice(0, -1);
  // yes, they want both camelCase and snake_case
  var payload = {
    appsflyer_id: options.appsFlyerId,
    eventName: track.event(),
    eventCurrency: track.currency(), // defaults to 'USD'
    eventTime: timestamp,
    af_events_api: 'true'
  };
  
  // Add ip address if event is client side
  if (track.ip()) payload.ip = track.ip();

  // AF requires you to change this to empty string if empty
  // Also, everything in the payload should be stringified
  var props = reject(track.properties({ revenue: 'af_revenue' }));
  payload.eventValue = isEmpty(props) ? '' : stringify(props);

  var ios = deviceType === 'ios';
  if (ios) {
    if (device.advertisingId) {
      payload.idfa = device.advertisingId.toString();
    }
    payload.bundle_id = track.proxy('context.app.namespace');
  } else if (device.advertisingId) {
    payload.advertising_id = device.advertisingId.toString();
  }

  return this
    .post(endpoint)
    .type('json')
    .set('authentication', this.settings.appsFlyerDevKey)
    .send(payload)
    .end(fn);
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
 * Get the correct endpoint based on device type.
 * 
 * @api private
 * @param {Object} library
 * @return {String} endpoint
 */

function selectEndpoint(deviceType, settings) {
  var endpoint;
  if (deviceType === 'ios') {
    // appsflyer wants ios to always have 'id' prefixed
    // metadata validates that they do not add the id in the settings so we can do it here
    endpoint = 'id' + settings.appleAppID;
  } else {
    endpoint = settings.androidAppID;
  } 
  return endpoint;
}

/**
 * Check if object is empty
 *
 * @api private
 * @param {Object} obj
 */

function isEmpty(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

/**
 * Stringify each value in object
 *
 * @api private
 * @param {Object} obj
 */

function stringify(obj) {
  var ret = {};
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      ret[prop] = obj[prop].toString();
    }
  }
  // Events will be silently dropped if you do not stringify
  return JSON.stringify(ret);
}

/**
 * Get the correct device type from the track payload.
 * This function is required to support backwards compatibility
 * with the functionality of this integration prior to v. 1.1.3
 * 
 * @api private
 * @param {Track} track
 * @return {String} deviceType
 */

function getDeviceType(track) {
  var deviceType;
  var deviceInfo = track.device() || {};

  if (deviceInfo.type) {
    deviceType = deviceInfo.type.toLowerCase();
  } else if (contains(track.library(), 'ios')) {
    deviceType = 'ios';
  } else {
    deviceType = 'android';
  }

  return deviceType;
}
