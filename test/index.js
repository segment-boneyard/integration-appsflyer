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
      appleAppID: 'id822613531',
      androidAppID: 'com.segment.analytics.sample',
      appsFlyerDevKey: 'pSX9JjSNkWUR8AJQQ7kQoE'
    };
    appsflyer = new AppsFlyer(settings);
    test = Test(appsflyer, __dirname);
  });

  it('should have the correct settings', function() {
    test
      .name('AppsFlyer')
      .channels(['mobile', 'server'])
      .endpoint('https://api2.appsflyer.com/inappevent/')
      .ensure('settings.appsFlyerDevKey');
  });

  describe('validate', function() {
    var msg;

    it('should be invalid if ios and no apple app id', function() {
      msg = {
        context: {
          library: { name: 'ios' }
        },
        integrations: {
          AppsFlyer: {
            appsFlyerId: 'xxx'
          }
        }
      };
      delete settings.appleAppID;

      test.invalid(msg, settings);
    });

    it('should be invalid if you do not manually send appsflyer_id', function() {
      msg = {
        context: {
          library: { name: 'ios' }
        }
      };
      test.invalid(msg, settings);
    });

    it('should be valid without apple app id if android', function() {
      msg = {
        context: {
          library: { name: 'android' }
        },
        integrations: {
          AppsFlyer: {
            appsFlyerId: 'xxx'
          }
        }
      };
      test.valid(msg, settings);
    });
  });

  describe('track', function() {
    it('should send a track event for ios', function(done) {
      var json = test.fixture('track-event-ios');

      test
        .track(json.input)
        .request(1)
        .sends(json.output)
        .expects(200)
        .end(done);
    });

    it('should send a track event for android', function(done) {
      var json = test.fixture('track-event-android');

      test
        .track(json.input)
        .request(1)
        .sends(json.output)
        .expects(200)
        .end(done);
    });

    it('should send revenue for ios', function(done) {
      var json = test.fixture('track-event-revenue-ios');

      test
        .track(json.input)
        .request(1)
        .sends(json.output)
        .expects(200)
        .end(done);
    });

    it('should send revenue for android', function(done) {
      var json = test.fixture('track-event-revenue-android');

      test
        .track(json.input)
        .request(1)
        .sends(json.output)
        .expects(200)
        .end(done);
    });
  });
});
