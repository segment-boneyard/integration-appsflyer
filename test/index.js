'use strict';

var AppsFlyer = require('..');
var Test = require('segmentio-integration-tester');

describe('AppsFlyer', function() {
  var settings;
  var test;
  var appsflyer;

  beforeEach(function() {
    settings = {
      appleAppID: '822613531',
      androidAppID: 'com.segment.analytics.sample',
      appsFlyerDevKey: 'pSX9JjSNkWUR8AJQQ7kQoE'
    };
    appsflyer = new AppsFlyer(settings);
    test = Test(appsflyer, __dirname);
  });

  it('should have the correct settings', function() {
    test
      .name('AppsFlyer')
      .channels(['mobile', 'client', 'server'])
      .endpoint('https://api2.appsflyer.com/inappevent/')
      .ensure('settings.appsFlyerDevKey');
  });

  describe('validate', function() {
    var msg;

    it('should be invalid if ios and no apple app id', function() {
      delete settings.appleAppID;

      msg = {
        context: {
          device: {
            manufacturer: 'some-brand',
            type: 'ios',
            advertisingId: '159358'
          }
        },
        integrations: {
          AppsFlyer: {
            appsFlyerId: 'xxx'
          }
        }
      };

      test.invalid(msg, settings);
    });

    it('should be invalid if android and no android app id', function() {
      delete settings.androidAppID;

      msg = {
        context: {
          device: {
            manufacturer: 'some-brand',
            type: 'android',
            advertisingId: '159358'
          }
        },
        integrations: {
          AppsFlyer: {
            appsFlyerId: 'xxx'
          }
        }
      };

      test.invalid(msg, settings);
    });

    it('should be invalid if you do not manually send appsflyer_id', function() {
      msg = {
        context: {
          device: {
            manufacturer: 'some-brand',
            type: 'ios',
            advertisingId: '159358'
          }
        }
      };

      test.invalid(msg, settings);
    });

    it('should be invalid if you do not send an advertisingId', function() {
      msg = {
        context: {
          device: {
            manufacturer: 'some-brand',
            advertisingId: '159358'
          }
        }
      };
      test.invalid(msg, settings);
    });

    it('should be invalid if you do not send a device type', function() {
      msg = {
        context: {
          device: {
            manufacturer: 'some-brand',
            type: 'ios'
          }
        }
      };
      test.invalid(msg, settings);
    });

    it('should be invalid if you do not send "ios" or "android" as device type values', function() {
      msg = {
        context: {
          device: {
            manufacturer: 'some-brand',
            type: 'some_random_value'
          }
        }
      };
      test.invalid(msg, settings);
    });

    it('should be valid without apple app id if android', function() {
      delete settings.appleAppID;

      msg = {
        context: {
          device: {
            manufacturer: 'some-brand',
            type: 'android',
            advertisingId: '159358'
          }
        },
        integrations: {
          AppsFlyer: {
            appsFlyerId: 'xxx'
          }
        }
      };

      test.valid(msg, settings);
    });

    it('should be valid without android app id if apple', function() {
      delete settings.androidAppID;

      msg = {
        context: {
          device: {
            manufacturer: 'some-brand',
            type: 'ios',
            advertisingId: '159358'
          }
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
        .request(0)
        .sends(json.output)
        .expects(200)
        .end(done);
    });

    it('should send a track event for android', function(done) {
      var json = test.fixture('track-event-android');

      test
        .track(json.input)
        .request(0)
        .sends(json.output)
        .expects(200)
        .end(done);
    });

    it('should send props for ios', function(done) {
      var json = test.fixture('track-event-props-ios');

      test
        .track(json.input)
        .request(0)
        .sends(json.output)
        .expects(200)
        .end(done);
    });

    it('should send props for android', function(done) {
      var json = test.fixture('track-event-props-android');

      test
        .track(json.input)
        .request(0)
        .sends(json.output)
        .expects(200)
        .end(done);
    });
  });
});
