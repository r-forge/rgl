#ifndef RGL_POINT_SET_HPP
#define RGL_POINT_SET_HPP

#include "PrimitiveSet.hpp"

class PointSet : public PrimitiveSet
{ 
public:
  PointSet(Material& material, int nvertices, double* vertices, bool in_ignoreExtent, bool bboxChange=false);
  /**
   * overloaded
   **/  
  virtual void getShapeName(char* buffer, int buflen) { strncpy(buffer, "points", buflen); };
};

#endif // RGL_POINT_SET_HPP

