#ifndef RENDERCONTEXT_HPP
#define RENDERCONTEXT_HPP

class Scene;
class Viewpoint;
class GLBitmapFont;

#include "math.h"

class RenderContext
{
public:
  Scene* scene;
  RectSize size;
  Viewpoint* viewpoint;
  GLBitmapFont* font;
  double time;
  double lastTime;
  double deltaTime;
};

#endif // RENDERCONTEXT_HPP
