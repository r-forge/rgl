#include "PrimitiveSet.hpp"

//////////////////////////////////////////////////////////////////////////////
//
// CLASS
//   FaceSet
//

FaceSet::FaceSet(Material& in_material, GLenum in_type, int in_nelements, double* in_vertex)  
: PrimitiveSet(in_material, in_type, in_nelements, in_vertex)
{
}

void FaceSet::draw(RenderContext* renderContext) {
  if (material.lit)
    normalArray.beginUse();

  PrimitiveSet::draw(renderContext);

  if (material.lit)
    normalArray.endUse();
}


