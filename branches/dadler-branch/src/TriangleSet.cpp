#include "PrimitiveSet.hpp"

//////////////////////////////////////////////////////////////////////////////
//
// CLASS
//   TriangleSet
//

TriangleSet::TriangleSet(Material& in_material, int in_nelements, double* in_vertex) 
  : FaceSet(in_material, GL_TRIANGLES,     in_nelements, in_vertex) 
{
  if (material.lit) {
    normalArray.alloc(nelements);
    for (int i=0;i<nelements-2;i+=3) {
      normalArray[i+2] = normalArray[i+1] = normalArray[i] = vertexArray.getNormal(i,i+1,i+2);
    }
  }
}


