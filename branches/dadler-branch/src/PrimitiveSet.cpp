#include "PrimitiveSet.hpp"

//////////////////////////////////////////////////////////////////////////////
//
// CLASS
//   PrimitveSet
//

PrimitiveSet::PrimitiveSet(Material &in_material, GLenum in_type, int in_nelements, double* vertex)
: Shape(in_material)
{
  type = in_type;

  nelements = in_nelements;

  material.colorPerVertex(true, nelements);

  vertexArray.alloc(nelements);
  for(int i=0;i<nelements;i++) {
    vertexArray[i].x = (float) vertex[i*3+0];
    vertexArray[i].y = (float) vertex[i*3+1];
    vertexArray[i].z = (float) vertex[i*3+2];
    boundingBox += vertexArray[i];
  }
}

void PrimitiveSet::draw(RenderContext* renderContext) {
  material.beginUse(renderContext);
  vertexArray.beginUse();

  glDrawArrays( type, 0, nelements );

  vertexArray.endUse();
  material.endUse(renderContext);
}


