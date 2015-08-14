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
//    var ctx = el.getContext("2d");

//    el.innerText = x.objects["7"].type + "\n" + Object.getOwnPropertyNames(x.objects["7"]);
//    el.innerText = x.objects["7"].type + "\n" + x.objects["7"].vertices;
    //  ctx.fillText(c, 10,10);
    rgl.initialize(el, x);

  },

  resize: function(el, width, height, instance) {

  }

});
