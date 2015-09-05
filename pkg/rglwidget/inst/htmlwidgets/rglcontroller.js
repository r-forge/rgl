HTMLWidgets.widget({

  name: 'rglcontroller',

  type: 'output',

  initialize: function(el, width, height) {
    return {
    };

  },

  renderValue: function(el, x, instance) {
    var applyVals = function() {

      /* We might be running before the scene exists.  If so, it
         will have to apply our initial value. */

        var scene = window[x.sceneId].rglinstance;
        if (typeof scene !== "undefined") {
          scene.applyControls(x.controls);
          instance.initialized = true;
        } else {
          instance.controls = x.controls;
          instance.initialized = false;
        }
      };

    el.rglcontroller = instance;

    if (x.respondTo !== null) {
      var control = window[x.respondTo];
      if (typeof control !== "undefined") {
        var self = this, i, oldhandler = control.onchange;
        control.onchange = function() {
          for (i=0; i<x.controls.length; i++) {
            x.controls[i].value = control.value;
          }
          if (oldhandler !== null)
            oldhandler.call(this);
          applyVals();
        };
        control.onchange();
      }
    }
    applyVals();
  },

  resize: function(el, width, height, instance) {
  }

});
