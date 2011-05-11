#ifndef RGL_LINE_SET_HPP
#define RGL_LINE_SET_HPP

#include "PrimitiveSet.hpp"

class LineSet : public PrimitiveSet
{ 
public:
  LineSet(Material& material, int nvertices, double* vertices, bool in_ignoreExtent, bool in_bboxChange=false);
  LineSet(Material& in_material, bool in_ignoreExtent, bool in_bboxChange);

  /**
   * overloaded
   **/  
  virtual void getShapeName(char* buffer, int buflen) { strncpy(buffer, "lines", buflen); };
};

#endif // RGL_LINE_SET_HPP

