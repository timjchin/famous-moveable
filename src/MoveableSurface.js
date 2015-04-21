/* globals define */
define(function(require, exports, module) {
  'use strict';
  var Surface = require('famous/core/Surface');
  var MoveableView = require('./MoveableView');
  var ContainerSurface = require('famous/surfaces/ContainerSurface');
  var InputSurface = require('famous/surfaces/InputSurface');
  var FormContainerSurface = require('famous/surfaces/FormContainerSurface');
  var SubmitInputSurface = require('famous/surfaces/SubmitInputSurface');
  var TextareaSurface = require('famous/surfaces/TextareaSurface');

  /**
   *  MoveableSurface gives a surface that allow it to 
   *  be manipulated directly, without having to add a modifier.
   *  By default, it sizes surface to be true sized, meaning that
   *  the size of the surface is equal to the size of the fragment
   *  of HTML passed in.
   *
   *  @class MoveableSurface
   *  @extends MoveableView
   */
  function MoveableSurface (options) {
    MoveableView.apply(this, arguments);
    if (!options) options = {};
    if (!options.size) options.size = [true, true];
    if (!options.type || options.type == 'surface') {
      this._surface = new Surface(options);
    } 
    else if (options.type == 'container') {
      this._surface = new ContainerSurface(options);
    } 
    else if (options.type == 'input') {
      this._surface = new InputSurface(options);
      MoveableSurface.mixin.call(this, this._surface, [
        'setPlaceholder',
        'focus',
        'blur',
        'setValue',
        'getValue',
        'setType',
        'setName',
        'getName'
      ]);
    } 
    else if (options.type == 'form') {
      this._surface = new FormContainerSurface(options);
    } 
    else if (options.type == 'submit') {
      this._surface = new SubmitInputSurface(options);
      MoveableSurface.mixin.call(this, this._surface, [
        'setOnClick',
      ]);
    }
    else if (options.type == 'textarea') {
      this._surface = new TextareaSurface(options);
      MoveableSurface.mixin.call(this, this._surface, [
        'setPlaceholder',
        'focus',
        'blur',
        'setValue',
        'getValue',
        'setName',
        'getName',
        'setWrap',
        'setColumns',
        'setRows',
      ]);
    }

    this.add(this._surface);
    if (options.type !== 'container' && options.type !== 'form') {
      this.add = this._add = undefined;
    }
  }

  MoveableSurface.prototype = Object.create(MoveableView.prototype);
  MoveableSurface.prototype.constructor = MoveableSurface;

  MoveableSurface.mixin = function (surf, array) {
    for (var i = 0; i < array.length; i++) { 
      var key = array[i];
      this[key] = surf[key].bind(surf);
    }
  }

  MoveableSurface.getPassedOptions = function (self, prefix) {
    var optNames = ['Size', 'Content', 'Properties', 'Classes', 'Attributes'];
    var obj = {};
    for (var i = 0; i < optNames.length; i++) { 
      var optName = prefix + optNames[i];
      var currentOption = self.options[optName];
      if (currentOption) obj[optNames[i].toLowerCase()] = currentOption;
    }
    return obj; 
  }

  /**
   *  @method addListener
   */
  MoveableSurface.prototype.addListener = function () {
    return this._surface.on.apply(this._surface, arguments);
  }
  /**
   *  @method on
   */
  MoveableSurface.prototype.on = MoveableSurface.prototype.addListener;
  /**
   *  @method removeListener
   */
  MoveableSurface.prototype.removeListener = function () {
    return this._surface.removeListener.apply(this._surface, arguments);
  }
  /**
   *  @method off
   */
  MoveableSurface.prototype.off = MoveableSurface.prototype.removeListener;
  /**
   *  @method setAttributes
   */
  MoveableSurface.prototype.setAttributes = function () {
    return this._surface.setAttributes.apply(this._surface, arguments);
  }
  /**
   *  @method getAttributes
   */
  MoveableSurface.prototype.getAttributes = function () {
    return this._surface.getAttributes.apply(this._surface, arguments);
  }
  /**
   *  @method setProperties
   */
  MoveableSurface.prototype.setProperties = function () {
    return this._surface.setProperties.apply(this._surface, arguments);
  }
  /**
   *  @method getProperties
   */
  MoveableSurface.prototype.getProperties = function () {
    return this._surface.getProperties.apply(this._surface, arguments);
  }
  /**
   *  @method addClass
   */
  MoveableSurface.prototype.addClass = function () {
    return this._surface.addClass.apply(this._surface, arguments);
  }
  /**
   *  @method removeClass
   */
  MoveableSurface.prototype.removeClass = function () {
    return this._surface.removeClass.apply(this._surface, arguments);
  }
  /**
   *  @method toggleClass
   */
  MoveableSurface.prototype.toggleClass = function () {
    return this._surface.toggleClass.apply(this._surface, arguments);
  }
  /**
   *  @method setClasses
   */
  MoveableSurface.prototype.setClasses = function () {
    return this._surface.setClasses.apply(this._surface, arguments);
  }
  /**
   *  @method getClassList
   */
  MoveableSurface.prototype.getClassList = function () {
    return this._surface.getClassList.apply(this._surface, arguments);
  }
  /**
   *  @method setContent
   */
  MoveableSurface.prototype.setContent = function () {
    return this._surface.setContent.apply(this._surface, arguments);
  }
  /**
   *  @method getContent
   */
  MoveableSurface.prototype.getContent = function () {
    return this._surface.getContent.apply(this._surface, arguments);
  }
  /**
   *  @method getSize
   */
  MoveableSurface.prototype.getSize = function () {
    return this._surface.getSize.apply(this._surface, arguments);
  }

  module.exports = MoveableSurface;
});
