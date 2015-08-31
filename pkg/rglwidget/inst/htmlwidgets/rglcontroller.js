HTMLWidgets.widget({

  name: 'rglcontroller',

  type: 'output',

  initialize: function(el, width, height) {
    return {
    };

  },

  renderValue: function(el, x, instance) {
    el.rglcontroller = instance;
    instance.subscenes = [].concat(x.subscenes);
    var scene = window[x.sceneId].rglinstance;
    /* We might be running before the scene exists.  If so, it
       will have to apply our initial value. */
    if (typeof scene !== "undefined") {
      scene.applyControls(x.controls);
      instance.initialized = true;
    } else {
      instance.controls = x.controls;
      instance.initialized = false;
    }
  },

  resize: function(el, width, height, instance) {
  }

});
