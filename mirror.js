/*global window, document, Faye */
/*jslint vars: true, indent: 2 */

(function () {
  'use strict';

  var begin = function (beginControlling, beginMirroring) {
    var faye = new Faye.Client('/faye');

    if (window.location.hostname.indexOf('mirror') === 0) {
      beginMirroring(faye);
    } else {
      beginControlling(faye);
    }
  };

  var navigateTo = function (url) {
    var a = document.createElement('a');
    a.href = url;
    a.protocol = window.location.protocol;
    a.host = window.location.host;

    if (window.location.href !== a.href) {
      window.location.href = a.href;
    }
  };

  var beginControlling = function (faye) {
    window.addEventListener('scroll', function () {
      faye.publish('/scroll', { x: window.scrollX, y: window.scrollY });
    });

    window.addEventListener('click', function (event) {
      var element = event.target;

      while (element) {
        if (element.localName === 'a') {
          event.preventDefault();

          if (element.host === window.location.host || element.hostname === 'www.gov.uk') {
            faye.publish('/navigate', { url: element.href });
            navigateTo(element.href);
          }

          break;
        }

        element = element.parentNode;
      }
    });

    window.addEventListener('pageshow', function () {
      faye.publish('/scroll', { x: window.scrollX, y: window.scrollY });
      faye.publish('/navigate', { url: window.location.href });
    });

    var realPushState = window.history.pushState;
    window.history.pushState = function (state, title, url) {
      faye.publish('/navigate', { url: url });
      return realPushState.call(window.history, state, title, url);
    };

    faye.addExtension({
      outgoing: function (message, callback) {
        if (message.channel === '/meta/handshake') {
          faye.publish('/scroll', { x: window.scrollX, y: window.scrollY });
          faye.publish('/navigate', { url: window.location.href });
        }

        callback(message);
      }
    });
  };

  var beginMirroring = function (faye) {
    faye.subscribe('/scroll', function (message) {
      window.scrollTo(message.x, message.y);
    });

    faye.subscribe('/navigate', function (message) {
      navigateTo(message.url);
    });

    faye.addExtension({
      incoming: function (message, callback) {
        if (message.channel === '/meta/subscribe') {
          if (message.subscription === '/scroll') {
            window.scrollTo(message.ext.x, message.ext.y);
          } else if (message.subscription === '/navigate') {
            navigateTo(message.ext.url);
          }
        }

        callback(message);
      }
    });
  };

  begin(beginControlling, beginMirroring);
}());
