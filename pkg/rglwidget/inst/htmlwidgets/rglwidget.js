HTMLWidgets.widget({

  name: 'rglwidget',

  type: 'output',

  initialize: function(el, width, height) {

    return {
      // TODO: add instance fields as required
    }

  },

  renderValue: function(el, x, instance) {

    var rgl = new rglClass();
    rgl.initialize(el, x);

  },

  resize: function(el, width, height, instance) {

  }

});
