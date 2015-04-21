/* globals define */
define(function(require, exports, module) {
  'use strict';
  var OptionsManager = require('famous/core/OptionsManager');
  var Utility = require('famous/utilities/Utility');

  /**
   *  LayoutBase is a base class for manipulating
   *  children to move them into layouts. LayoutBase
   *  classes will be provided arrays of references to children
   *  and a parallel array of the known size of each child.
   *
   *  @class LayoutBase
   */
  function LayoutBase (options) {
    this.options = Utility.clone(this.constructor.DEFAULT_OPTIONS || {});
    this._optionsManager = new OptionsManager(this.options);
    if (options) this.setOptions(options);
  }

  LayoutBase.DEFAULT_OPTIONS = {};

  /**
   *  @method layout
   *  @param children [array] array of children to operate on
   *  @param sizes [array] sizes of children
   */
  LayoutBase.prototype.layout = function (children, sizes) {};

  /**
   *  @method getSize
   *  @param children [array] array of children to operate on
   *  @param sizes [array] sizes of children
   */
  LayoutBase.prototype.getSize = function (children, sizes) {};

  /**
   *  @method setOptions
   *  @param options [Object] options object to mix into current options
   */
  LayoutBase.prototype.setOptions = function (options) {
    this._optionsManager.patch(options);
    return this;
  }
  

  module.exports = LayoutBase;
});
