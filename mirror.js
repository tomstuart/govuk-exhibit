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

  var beginControlling = function (faye) {
    window.addEventListener('scroll', function () {
      faye.publish('/scroll', { x: window.scrollX, y: window.scrollY });
    });
  };

  var beginMirroring = function (faye) {
    faye.subscribe('/scroll', function (message) {
      window.scrollTo(message.x, message.y);
    });
  };

  begin(beginControlling, beginMirroring);
}());
