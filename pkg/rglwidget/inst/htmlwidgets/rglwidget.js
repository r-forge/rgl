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
    var names = Object.getOwnPropertyNames(x.objects);
    for (var i=0; i<names.length; i++) {
      el.innerText = el.innerText + names[i] + ":" + x.objects[names[i]].type + "\n"
    }

  },

  resize: function(el, width, height, instance) {

  }

});
