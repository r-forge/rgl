#include "PrimitiveSet.hpp"

//////////////////////////////////////////////////////////////////////////////
//
// CLASS
//   LineSet
//

LineSet::LineSet(Material& in_material, int in_nelements, double* in_vertex) 
  : PrimitiveSet(in_material, GL_LINES, in_nelements, in_vertex) 
{
  material.lit = false;
}


