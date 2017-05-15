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
      .channels(['server'])
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

    /**
    * Temporarily skipping this test per: https://segment.zendesk.com/agent/tickets/73014.
    * Despite what their documentation says, AppsFlyer's API will accept events wihtout an
    * advertisingId / idfa property. This ensure block was causing issues for customers
    * that have been using this integration without sending advertisingId previously.
    * AppsFlyer will be working to migrate people away from doing this in the next couple of months.
    *
    * @ccnixon 05/10/2017
    */

    it.skip('should be invalid if you do not send an advertisingId', function() {
      msg = {
        context: {
          device: {
            manufacturer: 'some-brand'
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

    // TODO: remove this test once AppsFlyer updates their API to block events without
    // an advertisingId.
    it('should be valid without an advertisingId', function() {
      msg = {
        context: {
          device: {
            manufacturer: 'some-brand'
          }
        },
        integrations: {
          AppsFlyer: {
            appsFlyerId: 'xxx'
          }
        }
      };
      test.valid(msg, settings);
    })

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
    it('should default the device type to android if the event is from a server-side library or device.type is not explicitly defined', function(done) {
      var json = test.fixture('track-event-server-side');
      test
        .track(json.input)
        .request(0)
        .sends(json.output)
        .expects(200)
        .end(done);
    });

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
