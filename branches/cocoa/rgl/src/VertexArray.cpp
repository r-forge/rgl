#include "VertexArray.hpp"
#include "opengl.hpp"

VertexArray::VertexArray()
{
  arrayptr = NULL;
}

VertexArray::~VertexArray()
{
  if (arrayptr)
    delete[] arrayptr;
}

void VertexArray::alloc(int nvertex)
{
  if (arrayptr)
    delete[] arrayptr;

  arrayptr = new float [nvertex*3];
}

void VertexArray::copy(int nvertex, double* vertices)
{
  for(int i=0;i<nvertex;i++) {
    arrayptr[i*3+0] = (float) vertices[i*3+0];
    arrayptr[i*3+1] = (float) vertices[i*3+1];
    arrayptr[i*3+2] = (float) vertices[i*3+2];
  }
}

void VertexArray::setVertex(int index, double* v) {
  arrayptr[index*3+0] = (float) v[0];
  arrayptr[index*3+1] = (float) v[1];
  arrayptr[index*3+2] = (float) v[2];
}

void VertexArray::beginUse() {
  glEnableClientState(GL_VERTEX_ARRAY);
  glVertexPointer(3, GL_FLOAT, 0, (const GLvoid*) arrayptr );
}

void VertexArray::endUse() {
  glDisableClientState(GL_VERTEX_ARRAY);
}

Vertex VertexArray::computeNormal(int iv1, int iv2, int iv3)
{
  Vertex normal;

  Vertex& v1 = (*this)[iv1];
  Vertex& v2 = (*this)[iv2];
  Vertex& v3 = (*this)[iv3];

  Vertex a(v3-v2), b(v1-v2);

  normal = a.cross(b);

  normal.normalize();

  return normal;
}


