HTMLWidgets.widget({

  name: 'rglwidget',

  type: 'output',

  initialize: function(el, width, height) {

    return {
    };

  },

  renderValue: function(el, x, instance) {

    var rgl = new rglClass();
    rgl.initialize(el, x);
    rgl.drawInstance();
  },

  resize: function(el, width, height, instance) {
    if (typeof instance.resize === "function")
      instance.resize();
  }

});
