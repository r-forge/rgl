#ifndef SHAPE_HPP
#define SHAPE_HPP

#include "SceneNode.hpp"
#include "Material.hpp"
#include "RenderContext.hpp"

#include "opengl.h"
#include "geom.hpp"

//
// CLASS
//   Shape
//

class Shape : public SceneNode
{
public:
  Shape(Material& in_material,TypeID in_typeID=SHAPE);
  virtual void render(RenderContext* renderContext);
  virtual void update(RenderContext* renderContext);
  virtual void draw(RenderContext* renderContext) = 0;
  const AABox& getBoundingBox() const { return boundingBox; }
  const Material& getMaterial() const { return material; }
protected:
  AABox    boundingBox;
  Material material;
private:
  GLuint   displayList;
protected:
  bool     doUpdate;
};

#endif // SHAPE_HPP
