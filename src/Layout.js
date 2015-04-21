/* globals define */
define(function(require, exports, module) {
  'use strict';

  var MoveableView = require('./MoveableView');
  var MoveableSurface = require('./MoveableSurface');
  var Transform = require('famous/core/Transform');
  var Utils = require('./Utils');
  var LayoutBase = require('./LayoutBase');

  /**
   *  Layout is a base layout class, which allows for
   *  classes extended from LayoutBase to operate
   *  on the children provided.
   *
   *  @class Layout
   *  @extends MoveableView
   */
  function Layout (options) {
    MoveableView.apply(this, arguments);
    this._initialized = false;
    this._childSizes = [];
    this._children = this.options.children;
    this._activeLayout = this.options.layout;

    this._onResize = this._onResize.bind(this);
    for (var i = 0; i < this._children.length; i++) {
      var child = this._children[i];
      child.on('resize', this._onResize);
      this.add(child);
    }

    this._listenForSize();
  }

  Layout.prototype = Object.create(MoveableView.prototype);
  Layout.prototype.constructor = Layout;

  /**
   *  @method destroy
   */
  Layout.prototype.destroy = function () {
    for (var i = 0; i < this._children.length; i++) { 
      var child = this._children[i];
      child.off('resize', this._onResize);
    }
  }

  Layout.prototype._onResize = function () {
    this._sizeDirty = true;
  }
  
  /**
   *  @method layout
   */
  Layout.prototype.layout = function () {
    this._readSizes();
    if (this._activeLayout) {
      this._activeLayout.layout(this._children, this._childSizes);
    }
    return this;
  }

  /**
   *  @method getLayout
   */
  Layout.prototype.getLayout = function () {
    return this._activeLayout;
  }

  /**
   *  @method setLayout
   *  @param {LayoutBase} Layout
   */
  Layout.prototype.setLayout = function (layout) {
    this._activeLayout = layout;
  }

  /**
   *  @method setLayoutOptions
   */
  Layout.prototype.setLayoutOptions = function (options) {
    this._activeLayout.setOptions(options);
    return this;
  }

  /**
   *  @method getSize
   */
  Layout.prototype.getSize = function () {
    if (this._initialized && this._activeLayout) {
      return this._activeLayout.getSize(
        this._children, this._childSizes);
    }
    else return undefined;
  }

  Layout.DEFAULT_OPTIONS = {
  };

  /**
   *  @method _listenForSize
   *  @protected
   */
  Layout.prototype._listenForSize = function (child, anim) {
    var self = this;
    Utils.when(function () {
      for (var i = 0; i < self._children.length; i++) { 
        var child = self._children[i];
        var size = child.getSize();
        if (!size || size[0] === true || size[1] === true || size[0] === 0 || size[1] === 0) { 
          return false;
        }
        return true;
      }
    }, this._sizeSafe.bind(this));
  }

  /**
   *
   */
  Layout.prototype._sizeSafe = function (child, anim) {
    this._initialized = true;
    this.setSize(this.getSize.bind(this));
    this.layout();
  }

  /**
   *  @method _readSizes
   *  @protected
   */
  Layout.prototype._readSizes = function () {
    for (var i = 0; i < this._children.length; i++) { 
      var child = this._children[i];
      var childSize = child.getSize();
      this._childSizes[i] = childSize.slice(0);
    }
  }

  /**
   *  @method getSize
   */
  Layout.prototype.getSize = function () {
    if (this._activeLayout && this._activeLayout.getSize !== LayoutBase.prototype.getSize) {
      this._readSizes();
      return this._activeLayout.getSize(this._children, this._childSizes);
    }
    var min = [0,0,0];
    var max = [0,0,0];
    for (var i = 0; i < this._children.length; i++) { 
      var child = this._children[i];
      var childSize = child.getSize();
      childSize[2] = 0;
      var transform = child.getTransform();
      if (!transform) continue;
      var translate = Transform.getTranslate(transform);
      for (var j = 0; j < translate.length; j++) { 
        if (translate[j] < min[j]) {
          min[j] = translate[j];
        }
        var offset = childSize[j] + translate[j];
        if (offset > max[j]) {
          max[j] = offset;
        }
      }
    }
    return [
      max[0] - min[0],
      max[1] - min[1],
      max[2] - min[2],
    ];
  }

  Layout.prototype.render = function () {
    if (this._sizeDirty) {
      this.layout();
      this._sizeDirty = false;
    }
    return MoveableView.prototype.render.call(this);
  }

  module.exports = Layout;
});
