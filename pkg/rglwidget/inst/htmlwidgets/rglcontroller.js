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
        var self = this, i, oldhandler = control.onchange,
            state = "idle";
        control.onchange = function() {
          /* If we are called n>0 times while servicing a previous call, we want to finish
             the current call, then run again.  But the old handler might want to
             see every change. */
          if (state !== "idle") {
            state = "interrupted";
            if (oldhandler !== null)
              oldhandler.call(this);
          }
          do {
            state = "busy";
            for (i=0; i<x.controls.length; i++) {
              x.controls[i].value = control.value;
            }
            if (oldhandler !== null)
              oldhandler.call(this);
            applyVals();
            if (state === "busy")
              state = "idle";
          } while (state !== "idle");
        };
        control.onchange();
      }
    }
    applyVals();
  },

  resize: function(el, width, height, instance) {
  }

});
