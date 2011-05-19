#ifndef LAYER_HPP
#define LAYER_HPP

#include "SceneNode.hpp"

typedef void (*LayerCallback)();

class Layer : public SceneNode
{
public:
  Layer(LayerCallback cb) : SceneNode(LAYER), mCallback(cb) { }
  void renderGL() { mCallback(); }
  LayerCallback mCallback;
};

#endif /* LAYER_HPP */

