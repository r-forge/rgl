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
    instance.rgl = rgl;
  },

  resize: function(el, width, height, instance) {
    instance.rgl.resize();
  }

});
