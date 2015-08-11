HTMLWidgets.widget({

  name: 'rglwidget',

  type: 'output',

  initialize: function(el, width, height) {

    return {
      // TODO: add instance fields as required
    }

  },

  renderValue: function(el, x, instance) {

    el.innerText = ""; //Object.getOwnPropertyNames(x.objects["4"].type);
    var names = Object.getOwnPropertyNames(x);
    el.innerText = names + "\n";

  },

  resize: function(el, width, height, instance) {

  }

});
