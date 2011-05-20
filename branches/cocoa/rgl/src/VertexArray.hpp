#ifndef RGL_VERTEX_ARRAY_HPP
#define RGL_VERTEX_ARRAY_HPP

#include "rglmath.h"

class VertexArray
{
public:

  VertexArray();
  ~VertexArray();

  void   alloc    (int nvertex);
  void   copy     (int nvertex, double* vertices);
  void   beginUse ();
  void   endUse   ();
  void   setVertex(int index, double* v);
  
  Vertex computeNormal(int iv1, int iv2, int iv3); // specify three indices making up the triangle to compute the normal.

  inline Vertex& operator[](int index) { return (Vertex&) arrayptr[index*3]; }
  
protected:
  float* arrayptr;
};

#endif // RGL_VERTEX_ARRAY_HPP

