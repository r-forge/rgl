HTMLWidgets.widget({

  name: 'rglwidget',

  type: 'output',

  initialize: function(el, width, height) {
    return {
    };

  },

  renderValue: function(el, x, instance) {
    var rgl = new rglClass(), i, controller;
    rgl.initialize(el, x);
    el.rglwidget = rgl;

    /* We might have been called after (some of) the controllers were rendered.
       We need to make sure we respond to their initial values. */

    if (typeof x.controllers !== "undefined") {
      x.controllers = [].concat(x.controllers);
      for (i = 0; i<x.controllers.length; i++) {
        controller = window[x.controllers[i]];
        if (typeof controller !== "undefined") {
          controller = controller.rglcontroller;
          if (!controller.initialized) {
            rgl.applyControls(controller.controls);
            controller.initialized = true;
          }
        }
      }
    }
    rgl.drawInstance();
  },

  resize: function(el, width, height, instance) {
    if (typeof instance.resize === "function")
      instance.resize();
  }

});
