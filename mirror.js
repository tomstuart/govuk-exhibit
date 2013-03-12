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
    if (window.location.href !== url) {
      window.location.href = url;
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
          faye.publish('/navigate', { url: element.href });
          navigateTo(element.href);
          break;
        }

        element = element.parentNode;
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
  };

  begin(beginControlling, beginMirroring);
}());
