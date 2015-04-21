** Famous Moveable **

Famous Moveable provides simple, animatable base classes for Famo.us 0.3.x.

#### MoveableView
All classes extend from MoveableView. MoveableView gives your views a preset Modifier that will lazy instantiate Transitionables as needed.

After creating a view, you are provided with getters / setters for: opacity, transform, origin, align, size, and proportions.

#### MoveableSurface
MoveableSurface provides the same DOM manipulation interface as a Famo.us Surface, however since it inherits from a MoveableView, it also provides methods to allow you to animate and control the surface. 
It's a simple shim to provide the auto creation of a modifier, but across a larger famo.us app, it can reduce repeated code. In addition, 

Comparison:
```js
var mainContext = Engine.createContext();
mainContext.setPerspective(1000);

var surf = new MoveableSurface({
  size: [50,50], 
  properties: { 
    backgroundColor: 'red',
    backfaceVisibility: 'visible'
  }
});

mainContext.add(surf);

surf.setTransform(Transform.translate(50, 50), {
  curve: 'outBack',
  duration: 500 
});
```

```js
var mainContext = Engine.createContext();
mainContext.setPerspective(1000);

var tt = new TransitionableTransform();
var mod = new Modifier({
  transform: tt
});

var surf = new Surface({
  size: [50,50], 
  properties: { 
    backgroundColor: 'red',
    backfaceVisibility: 'visible'
  }
});

mainContext.add(modifier).add(surf);

tt.set(Transform.translate(50, 50), {
  curve: 'outBack',
  duration: 500 
});
```

#### RegisterCurves
Require this once, if you want to be able to reference curves as a string:
```js
surf.setTransform(Transform.translate(50, 50), {
  curve: 'outBack',
  duration: 500 
});
// instead of:
var Easing = require('famous/transitions/Easing');
surf.setTransform(Transform.translate(50, 50), {
  curve: Easing.outBack,
  duration: 500 
});
```

#### Layout && LayoutBase
Layout is a class that allows for switching of LayoutBase extension classes, with smooth transitions between layouts. 
LayoutBase is meant to provide the expected interface of a class going into a Layout, and provides option handling. 
Custom LayoutBase classes are meant to overwrite two methods: layout and getSize. Both methods are provided with an array reference to the current children, and their known size.
