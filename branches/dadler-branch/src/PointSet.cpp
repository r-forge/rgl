#include "PrimitiveSet.hpp"

//////////////////////////////////////////////////////////////////////////////
//
// CLASS
//   PointSet
//

PointSet::PointSet(Material& in_material, int in_nelements, double* in_vertex) 
  : PrimitiveSet(in_material, GL_POINTS, in_nelements, in_vertex) 
{
  material.lit = false;
} 


