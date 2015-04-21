/* globals define */
define(function(require, exports, module) {
  'use strict';
  var Engine = require('famous/core/Engine');
  var Utility = require('famous/utilities/Utility');
  var Transform = require('famous/core/Transform');

  module.exports = {
    inherits: function (_parent, _child) {
      _child.prototype = Object.create(_parent.prototye);
      _child.prototype.constructor = child;
    },
    when: function (predicate, cb) {
      var checkPred = function () {
        var bool = predicate();
        if (bool) {
          cb();
        }
        else {
          Engine.nextTick(checkPred);
        }
      }
      Engine.nextTick(checkPred);
    },
    extend: function (a /**, b.. */) {
      var _args = Array.prototype.slice.call(arguments, 1, arguments.length)
      for (var i = 0; i < _args.length; i++) { 
        var obj = _args[i];
        for (var key in obj) {
          a[key] = obj[key];
        }
      }
      return a;
    },
    originMatrix: function (origin, size, transform) {
      return Transform.moveThen([origin[0] * size[0], origin[1] * size[1], 0], transform); 
    },
    mergeOptions: function (defaults, options) {
      var cloned = Utility.clone(defaults);
      for (var key in options) { 
        cloned[key] = options[key];
      }
      return cloned;
    }
  };

});
