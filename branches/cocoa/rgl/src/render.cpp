#include "render.h"

#include "opengl.hpp"

//////////////////////////////////////////////////////////////////////////////
//
//  SECTION: MATERIAL
//
//////////////////////////////////////////////////////////////////////////////



//////////////////////////////////////////////////////////////////////////////
//
// CLASS
//   VertexArray
//

//////////////////////////////////////////////////////////////////////////////
//
// CLASS
//   NormalArray
//

void NormalArray::beginUse() {
  glEnableClientState(GL_NORMAL_ARRAY);
  glNormalPointer(GL_FLOAT, 0, (const GLvoid*) arrayptr );
}

void NormalArray::endUse() {
  glDisableClientState(GL_NORMAL_ARRAY);
}

//////////////////////////////////////////////////////////////////////////////
//
// CLASS
//   TexCoordArray
//

TexCoordArray::TexCoordArray()
{
  arrayptr = NULL;
}

TexCoordArray::~TexCoordArray()
{
  if (arrayptr)
    delete[] arrayptr;
}

void TexCoordArray::alloc(int nvertex)
{
  if (arrayptr) {
    delete[] arrayptr;
    arrayptr = NULL;
  }
  arrayptr = new float[2*nvertex];
}

TexCoord& TexCoordArray::operator [] (int index) {
  return (TexCoord&) arrayptr[index*2];
}

void TexCoordArray::beginUse() {
  if (arrayptr) {
    glEnableClientState(GL_TEXTURE_COORD_ARRAY);
    glTexCoordPointer(2, GL_FLOAT, 0, (const GLvoid*) arrayptr );
  }
}

void TexCoordArray::endUse() {
  if (arrayptr)
    glDisableClientState(GL_TEXTURE_COORD_ARRAY);
}
