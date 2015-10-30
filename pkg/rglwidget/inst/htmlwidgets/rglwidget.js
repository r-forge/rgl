HTMLWidgets.widget({

  name: 'rglwidget',

  type: 'output',

  initialize: function(el, width, height) {
    el.width = width;
    el.height = height;
    return {};

  },

  renderValue: function(el, x, instance) {
    var rgl = new rglwidgetClass(), i, controller;
    rgl.initialize(el, x);

    /* We might have been called after (some of) the controllers were rendered.
       We need to make sure we respond to their initial values. */

    if (typeof x.controllers !== "undefined") {
      x.controllers = [].concat(x.controllers);
      for (i = 0; i<x.controllers.length; i++) {
        controller = window[x.controllers[i]];
        if (typeof controller !== "undefined") {
          controller = controller.rglcontroller;
          if (typeof controller !== "undefined" && !controller.initialized) {
            rgl.applyControls(el, controller.controls);
            controller.initialized = true;
          }
        }
      }
    }
    rgl.drawInstance();
  },

  resize: function(el, width, height, instance) {
    el.width = width;
    el.height = height;
    el.rglinstance.resize(el);
    el.rglinstance.drawInstance();
  }

});
