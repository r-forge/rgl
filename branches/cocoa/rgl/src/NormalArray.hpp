#ifndef RGL_NORMAL_ARRAY_HPP
#define RGL_NORMAL_ARRAY_HPP

#include "VertexArray.hpp"

class NormalArray : public VertexArray 
{
public:
  void beginUse();
  void endUse();
};

#endif // RGL_NORMAL_ARRAY_HPP

