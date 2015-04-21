/* globals define */
define(function(require, exports, module) {

  /**
   *  Require once. This file allows all easing functions to be
   *  registered and referenced by string.
   */
  var Easing = require('famous/transitions/Easing');
  var TweenTransition = require('famous/transitions/TweenTransition');
  var keys = Object.keys(Easing);

  for (var i = 0; i < keys.length; i++) { 
    TweenTransition.registerCurve(keys[i], Easing[keys[i]]);
  }

});
