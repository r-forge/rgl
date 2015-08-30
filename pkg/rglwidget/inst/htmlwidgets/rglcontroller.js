HTMLWidgets.widget({

  name: 'rglcontroller',

  type: 'output',

  initialize: function(el, width, height) {

    return {
    };

  },

  renderValue: function(el, x, instance) {

    var scene = window[x.sceneId];
    scene.applyControls(x);
  },

  resize: function(el, width, height, instance) {
  }

});
