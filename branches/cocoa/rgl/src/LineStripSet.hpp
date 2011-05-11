#ifndef RGL_LINE_STRIP_SET_HPP
#define RGL_LINE_STRIP_SET_HPP

#include "PrimitiveSet.hpp"

class LineStripSet : public PrimitiveSet
{
public:
  LineStripSet(Material& material, int in_nelements, double* in_vertex, bool in_ignoreExtent, bool in_bboxChange = false);
  void drawElement(RenderContext* renderContext, int index);
  /**
   * overloaded
   **/  
  virtual void getShapeName(char* buffer, int buflen) { strncpy(buffer, "linestrip", buflen); };
};

#endif // RGL_LINE_STRIP_SET_HPP

