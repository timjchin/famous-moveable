/* globals define */
define(function(require, exports, module) {
  'use strict';

  var OptionsManager = require('famous/core/OptionsManager');
  var RenderNode = require('famous/core/RenderNode');
  var EventEmitter = require('famous/core/EventEmitter');
  var View = require('famous/core/View');
  var Modifier = require('famous/core/Modifier');
  var Transitionable = require('famous/transitions/Transitionable');
  var TransitionableTransform = require('famous/transitions/TransitionableTransform');
  var Utility = require('famous/utilities/Utility');

  /**
   *  @class MoveableView
   */
  function MoveableView (options) {
    EventEmitter.apply(this, arguments);

    this._rootNode = new RenderNode();
    this._mod = new Modifier();
    this._node = this._rootNode.add(this._mod);

    this.options = Utility.clone(this.constructor.DEFAULT_OPTIONS || View.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);
    if (options) this.setOptions(options);

    this._transitionables = {
      origin: undefined,
      align: undefined,
      opacity: undefined,
      size: undefined,
      transform: undefined,
      proportions: undefined,
    };

    if (this.options.origin) this.setOrigin(this.options.origin)
    if (this.options.align) this.setAlign(this.options.align)
    if (this.options.translate) this.setTranslate(this.options.translate)
    if (this.options.rotate) this.setRotate(this.options.rotate)
    if (this.options.scale) this.setScale(this.options.scale)
    if (this.options.skew) this.setSkew(this.options.skew)
    if (this.options.transform) this.setTransform(this.options.transform)
    if (this.options.proportions) this.setProportions(this.options.proportions)
    if (this.options.opacity !== undefined) this.setOpacity(this.options.opacity)
  }

  MoveableView.prototype = Object.create(EventEmitter.prototype);
  MoveableView.prototype.constructor = MoveableView;

  MoveableView.DEFAULT_OPTIONS = {};

  MoveableView.types = {
    origin: 'origin',
    align: 'align',
    size: 'size',
    opacity: 'opacity',
    transform: 'transform',
    proportions: 'proportions',
  };

  MoveableView.createTransitionables = {
    origin: function (mod) {
      return new Transitionable([0,0]);
    },
    align: function (mod) {
      return new Transitionable([0,0]);
    },
    size: function (mod) {
      return new Transitionable([undefined,undefined]);
    },
    transform: function (mod) {
      return new TransitionableTransform();
    },
    opacity: function (mod) {
      return new Transitionable(1);
    },
    proportions: function (mod) {
      return new Transitionable([undefined,undefined]);
    }
  };

  MoveableView.attachToModifier = {
    origin: function (mod, val) {
      mod.originFrom(val);
    },
    align: function (mod, val) {
      mod.alignFrom(val);
    },
    size: function (mod, val) {
      mod.sizeFrom(val);
    },
    transform: function (mod, val) {
      mod.transformFrom(val);
    },
    opacity: function (mod, val) {
      mod.opacityFrom(val);
    },
    proportions: function (mod, val) {
      mod.proportionsFrom(val);
    }
  }

  MoveableView.afterCallback = function (count, callback) {
    return Utility.after(count, function () {
      if (callback) callback();
    });
  }

  MoveableView.prototype.off = EventEmitter.prototype.removeListener;
  /**
   *  @method getOptions
   */
  MoveableView.prototype.getOptions = function getOptions(key) {
    return this._optionsManager.getOptions(key);
  };
  /**
   *  @method render
   */
  MoveableView.prototype.render = function () {
    return this._rootNode.render();
  }
  /**
   *  @method setOptions
   *  @param [object] options to mix into this.options
   */
  MoveableView.prototype.setOptions = function setOptions(options) {
    this._optionsManager.patch(options);
  };
  /**
   *  Add an element to this View
   *  @method add
   */
  MoveableView.prototype.add = function add() {
    return this._node.add.apply(this._node, arguments);
  }; 
  /**
   *  @method getSize
   */
  MoveableView.prototype.getSize = function getSize() {
    if (this._node && this._node.getSize) {
      return this._node.getSize.apply(this._node, arguments) || this.options.size;
    }
    else return this.options.size;
  };
  
  
  /**
   *  @method _setByKey
   *  @protected
   *  @param {String} key - to set.
   *  @param {Array|Number|Transform|Function} value - to set on the transitionable
   *  @param {String} transition - to use
   *  @param {Function} cb - callback when completed
   */
  MoveableView.prototype._setByKey = function (key, value, transition, cb) {
    var trans;
    // functional modifier, directly attach.
    if (value instanceof Function) {
      // set to undefined to fall into the second case on a second set.
      this._transitionables[key] = undefined;
      MoveableView.attachToModifier[key](this._mod, value);
      return;
    }
    else if (!this._transitionables[key]) {
      this._transitionables[key] = MoveableView.createTransitionables[key]();
      MoveableView.attachToModifier[key](this._mod, this._transitionables[key]);
    }

    this._transitionables[key].set(value, transition, cb);
  };
  /**
   *  @method _validateTransform
   */
  MoveableView.prototype._validateTransform = function () {
    if (!this._transitionables.transform) {
      this._transitionables.transform = MoveableView.createTransitionables.transform();
      MoveableView.attachToModifier.transform(this._mod, this._transitionables.transform);
    }
  }

  /**
   *  @method _getByKey
   *  @protected
   *  @param {String} key to get value of.
   */
  MoveableView.prototype._getByKey = function (key) {
    if (this._transitionables[key]) {
      return this._transitionables[key].get();
    }
    else return undefined;
  }
  
  /**
   *  Stop animations in their current state. Either choose a key, 
   *  or halt all animatable properties.
   *
   *  @method halt
   */
  MoveableView.prototype.halt = function (key) {
    if (key && this._transitionables[key]) {
      this._transitionables[key].halt();
    }
    else {
      for (var key in this._transitionables) {
        if (this._transitionables[key]) this._transitionables[key].halt();
      }
    }
    return this;
  };

  /**
   *  @method delayByKey
   *  @param key [string] property to delay
   *  @param val [int] duration in milliseconds to delay by
   *  @param callback [function] callback to call when delay is complete
   */
  MoveableView.prototype.delayByKey = function (key, val, callback) {
    if (key == MoveableView.types.transform && this._transitionables[key]) {
      var callback = MoveableView.afterCallback(4, callback);
      this._transitionables[key].translate.delay(val, callback);
      this._transitionables[key].rotate.delay(val, callback);
      this._transitionables[key].skew.delay(val, callback);
      this._transitionables[key].scale.delay(val, callback);
    }
    else if (this._transitionables[key]) {
      this._transitionables[key].delay(val, callback);
    }
    return this;
  };
  /**
   *  @method setOrigin
   *  @param value [Array] value of the origin to set to
   *  @param transition [Object] Transition object (curve, duration)
   *  @param cb [function] Callback to call when complete
   */
  MoveableView.prototype.setOrigin = function (value, transition, cb) {
    this._setByKey(MoveableView.types.origin, value, transition, cb);
    return this;
  };
  /**
   *  Get the current Origin value.
   *  @method getOrigin
   */
  MoveableView.prototype.getOrigin = function () {
    return this._getByKey(MoveableView.types.origin);
  };
  /**
   *  @method setAlign
   *  @param value [Array] value of the Align to set to
   *  @param transition [Object] Transition object (curve, duration)
   *  @param cb [function] Callback to call when complete
   */
  MoveableView.prototype.setAlign = function (value, transition, cb) {
    this._setByKey(MoveableView.types.align, value, transition, cb);
    return this;
  };
  /**
   *  Get the current Align value.
   *  @method getAlign
   */
  MoveableView.prototype.getAlign = function () {
    return this._getByKey(MoveableView.types.align);
  };
  /**
   *  @method setSize
   *  @param value [Array] value of the Size to set to
   *  @param transition [Object] Transition object (curve, duration)
   *  @param cb [function] Callback to call when complete
   */
  MoveableView.prototype.setSize = function (value, transition, cb) {
    this._setByKey(MoveableView.types.size, value, transition, cb);
    return this;
  };
  /**
   *  Get the current Size value.
   *  @method getSize
   */
  MoveableView.prototype.getSize = function () {
    return this._getByKey(MoveableView.types.size);
  };
  /**
   *  @method setTransform
   *  @param value [Array] value of the Transform to set to
   *  @param transition [Object] Transition object (curve, duration)
   *  @param cb [function] Callback to call when complete
   */
  MoveableView.prototype.setTransform = function (value, transition, cb) {
    this._setByKey(MoveableView.types.transform, value, transition, cb);
    return this;
  };

  /**
   *  @method setTranslate
   *  @param value [Array] value of the Transform to set to
   *  @param transition [Object] Transition object (curve, duration)
   *  @param cb [function] Callback to call when complete
   */
  MoveableView.prototype.setTranslate = function (value, transition, cb) {
    this._validateTransform();
    this._transitionables.transform.setTranslate(value, transition, cb);
    return this;
  };

  /**
   *  @method getTranslate
   */
  MoveableView.prototype.getTranslate = function () {
    this._validateTransform();
    return this._transitionables.transform.translate.get();
  };

  /**
   *  @method setRotate
   *  @param value [Array] value of the Rotation in radians
   *  @param transition [Object] Transition object (curve, duration)
   *  @param cb [function] Callback to call when complete
   */
  MoveableView.prototype.setRotate = function (value, transition, cb) {
    this._validateTransform();
    this._transitionables.transform.setRotate(value, transition, cb);
    return this;
  };
  /**
   *  @method getRotate
   */
  MoveableView.prototype.getRotate = function () {
    this._validateTransform();
    return this._transitionables.transform.rotate.get();
  };
  /**
   *  @method setScale
   *  @param value [Array] value of scale
   *  @param transition [Object] Transition object (curve, duration)
   *  @param cb [function] Callback to call when complete
   */
  MoveableView.prototype.setScale = function (value, transition, cb) {
    this._validateTransform();
    this._transitionables.transform.setScale(value, transition, cb);
    return this;
  };
  /**
   *  @method getScale
   */
  MoveableView.prototype.getScale = function () {
    this._validateTransform();
    return this._transitionables.transform.rotate.get();
  };
  /**
   *  @method setSkew
   *  @param value [Array] value of the Rotation in radians
   *  @param transition [Object] Transition object (curve, duration)
   *  @param cb [function] Callback to call when complete
   */
  MoveableView.prototype.setSkew = function (value, transition, cb) {
    this._validateTransform();
    this._transitionables.transform.setSkew(value, transition, cb);
    return this;
  };
  /**
   *  @method getSkew
   */
  MoveableView.prototype.getSkew = function () {
    this._validateTransform();
    return this._transitionables.transform.skew.get();
  };
  /**
   *  @method setTransform
   *  @param value [Array] value of the Transform to set to
   *  @param transition [Object] Transition object (curve, duration)
   *  @param cb [function] Callback to call when complete
   */
  MoveableView.prototype.setTransform = function (value, transition, cb) {
    this._setByKey(MoveableView.types.transform, value, transition, cb);
    return this;
  };

  /**
   *  Get the current Transform value.
   *  @method getTransform
   */
  MoveableView.prototype.getTransform = function () {
    return this._getByKey(MoveableView.types.transform);
  };
  /**
   *  @method setOpacity
   *  @param value [Array] value of the Opacity to set to
   *  @param transition [Object] Transition object (curve, duration)
   *  @param cb [function] Callback to call when complete
   */
  MoveableView.prototype.setOpacity = function (value, transition, cb) {
    this._setByKey(MoveableView.types.opacity, value, transition, cb);
    return this;
  };
  /**
   *  Get the current Opacity value.
   *  @method getOpacity
   */
  MoveableView.prototype.getOpacity = function () {
    return this._getByKey(MoveableView.types.opacity);
  };
  /**
   *  @method setProportions
   *  @param value [Array] value of the Proportions to set to
   *  @param transition [Object] Transition object (curve, duration)
   *  @param cb [function] Callback to call when complete
   */
  MoveableView.prototype.setProportions = function (value, transition, cb) {
    this._setByKey(MoveableView.types.proportions, value, transition, cb);
    return this;
  };
  /**
   *  Get the current Proportions value.
   *  @method getProportions
   */
  MoveableView.prototype.getProportions = function () {
    return this._getByKey(MoveableView.types.proportions);
  };

  module.exports = MoveableView;
});
