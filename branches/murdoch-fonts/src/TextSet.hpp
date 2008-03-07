#ifndef TEXTSET_HPP
#define TEXTSET_HPP

#include "Shape.hpp"

//
// TEXTSET
//

#include "render.h"
#include "String.hpp"
#include "glgui.hpp"
#ifdef HAVE_FREETYPE
#include "FTGLOutlineFont.h"
#include "FTGLPolygonFont.h"
#include "FTGLBitmapFont.h"
#include "FTGLTextureFont.h"
#include "FTGLPixmapFont.h"
#include "DString.hpp"
#endif

class TextSet : public Shape {
public:
  TextSet(Material& in_material, int in_ntexts, char** in_texts, double *in_center, double in_adj,
          int in_ignoreExtent, FontArray& in_fonts);
  ~TextSet();
  void draw(RenderContext* renderContext);
  virtual void getShapeName(char* buffer, int buflen) { strncpy(buffer, "text", buflen); };

private:

  VertexArray vertexArray;
#ifdef HAVE_FREETYPE
  DStringArray textArray;
#else
  StringArray textArray;
#endif
  FontArray fonts;

  double adj;

};

#endif // TEXTSET_HPP

