#ifndef PRIMITIVE_SET_HPP
#define PRIMITIVE_SET_HPP

#include "Shape.hpp"

#include "render.h"

//
// ABSTRACT CLASS
//   PrimitiveSet
//

class PrimitiveSet : public Shape {
public:
  virtual void draw(RenderContext* renderContext);
protected:
  PrimitiveSet(Material& material, GLenum type, int nelements, double* vertex);
  int nelements;
  VertexArray vertexArray;
private:
  GLenum type;
};

class PointSet : public PrimitiveSet 
{ 
public:
  PointSet(Material& material, int in_nelements, double* in_vertex);

};

class LineSet : public PrimitiveSet 
{ 
public:
  LineSet(Material& material, int in_nelements, double* in_vertex);
};

//
// ABSTRACT CLASS
//   FaceSet
//

class FaceSet : public PrimitiveSet
{
public:
  void draw(RenderContext* renderContext);
protected:
  FaceSet(Material& material, GLenum type, int in_nelements, double* in_vertex);
  NormalArray normalArray;
};

class TriangleSet : public FaceSet
{ 
public:
  TriangleSet(Material& material, int in_nelements, double* in_vertex);
};

class QuadSet : public FaceSet 
{ 
public:
  QuadSet(Material& material, int in_nelements, double* in_vertex);
};


#endif // PRIMITIVE_SET_HPP
