#include "PrimitiveSet.hpp"

//////////////////////////////////////////////////////////////////////////////
//
// CLASS
//   QuadSet
//

QuadSet::QuadSet(Material& in_material, int in_nelements, double* in_vertex) 
  : FaceSet(in_material, GL_QUADS,     in_nelements, in_vertex) 
{
  if (material.lit) {
    normalArray.alloc(nelements);
    for (int i=0;i<nelements-3;i+=4) {
      normalArray[i+3] = normalArray[i+2] = normalArray[i+1] = normalArray[i] = vertexArray.getNormal(i,i+1,i+2);
    }
  }
}


