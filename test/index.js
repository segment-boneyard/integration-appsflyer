var Test = require('segmentio-integration-tester');
var assert = require('assert');
var should = require('should');
var AppsFlyer = require('..');

describe('AppsFlyer', function() {
  var settings;
  var test;
  var appsflyer;

  beforeEach(function() {
    settings = {
      appleAppID: 'id123456789',
      appsFlyerDevKey: 'com.appsflyer.myapp'
    };
    appsflyer = new AppsFlyer(settings);
    test = Test(appsflyer, __dirname);
  });

  it('should have the correct settings', function() {
    test
      .name('AppsFlyer')
      .channels(['mobile', 'server', 'client'])
      .endpoint('https://api2.appsflyer.com/inappevent/')
      .ensure('settings.appsFlyerDevKey');
  });
});
