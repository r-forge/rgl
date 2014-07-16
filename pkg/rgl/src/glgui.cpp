// C++ source
// This file is part of RGL.
//
// $Id$

#include <cstdio>
#ifdef HAVE_FREETYPE
#include "FTGL/ftgl.h"
#include "R.h"
#endif
#include "types.h"
#include "glgui.hpp"
#include "gl2ps.h"
#include "opengl.hpp"
#include "RenderContext.hpp"
#include "subscene.hpp"
#include "platform.h"

using namespace rgl;

//
// CLASS
//   GLFont
//

GLboolean GLFont::justify(double width, double height, double adjx, double adjy, const RenderContext& rc) {
  GLdouble pos[4], pos2[4];
  double basex = 0.0, basey = 0.0, scaling = 1.0;
  GLboolean valid;
  gl2ps_centering = GL2PS_TEXT_BL;
  
  if (adjx > 0) {

    if (rc.gl2psActive > GL2PS_NONE) scaling = GL2PS_SCALING;
     
    if ( adjx > 0.25 && rc.gl2psActive == GL2PS_POSITIONAL) {
      if (adjx < 0.75) {
        basex = 0.5;
        gl2ps_centering = GL2PS_TEXT_B;
      } else {
        basex = 1.0;
        gl2ps_centering = GL2PS_TEXT_BR;
      }
    }
  }  

  if ((adjx != basex) || (adjy != basey)) {
    glGetDoublev(GL_CURRENT_RASTER_POSITION, pos);    
    pos[0] = pos[0] - scaling*width*(adjx-basex); 
    pos[1] = pos[1] - scaling*height*(adjy-basey);
    gluUnProject( pos[0], pos[1], pos[2], rc.subscene->modelMatrix, rc.subscene->projMatrix, rc.subscene->pviewport, pos2, pos2 + 1, pos2 + 2);
    glRasterPos3dv(pos2);
  }
  
  glGetBooleanv(GL_CURRENT_RASTER_POSITION_VALID, &valid);
  return valid;
}

//
// CLASS
//   GLBitmapFont
//

GLBitmapFont::~GLBitmapFont() {
    delete [] widths;
    if (nglyph) glDeleteLists(listBase+GL_BITMAP_FONT_FIRST_GLYPH, nglyph);
};

double GLBitmapFont::width(const char* text) {
  double result = 0.0;
  for(int i=0; text[i]; i++) {
    char c;
    if ((int)(text[i]) >= (int)firstGlyph && (c = text[i] - firstGlyph) < (int)nglyph)
      result += widths[(int)c];
  }
  return result;
}

double GLBitmapFont::width(const wchar_t* text) {
  double result = 0.0;
  for(int i=0; text[i]; i++) {
    wchar_t c;
    if (text[i] >= firstGlyph && (c = text[i] - firstGlyph) < nglyph)
      result += widths[c];  
  }    
  return result;
}
  
double GLBitmapFont::height() {
  return ascent;
}

bool GLBitmapFont::valid(const char* text) {
  for (int i=0; text[i]; i++)
    if ((int)text[i] < (int)firstGlyph || text[i] - firstGlyph >= (int)nglyph)
      return false;
  return true;
}

void GLBitmapFont::draw(const char* text, int length, 
                        double adjx, double adjy, const RenderContext& rc) {
    
  if (justify(width(text), height(), adjx, adjy, rc)) {
    if (rc.gl2psActive == GL2PS_NONE) {
      glListBase(listBase);
      glCallLists(length, GL_UNSIGNED_BYTE, text);
    } else
      gl2psTextOpt(text, GL2PS_FONT, GL2PS_FONTSIZE*cex, gl2ps_centering, 0.0);
  }
}

void GLBitmapFont::draw(const wchar_t* text, int length, 
                        double adjx, double adjy, const RenderContext& rc) {
  
  if (justify(width(text), height(), adjx, adjy, rc)) {
    GLenum type = sizeof(wchar_t) == 4 ? GL_UNSIGNED_INT :
                  sizeof(wchar_t) == 2 ? GL_UNSIGNED_SHORT : GL_UNSIGNED_BYTE ;
    if (rc.gl2psActive == GL2PS_NONE) {
      glListBase(listBase);
      glCallLists(length, type, text);
    }
  // gl2ps doesn't support wchar_t?  Should convert?
  }
}

#ifdef HAVE_FREETYPE

GLFTFont::GLFTFont(const char* in_family, int in_style, double in_cex, const char* in_fontname) 
: GLFont(in_family, in_style, in_cex, in_fontname, true)
{
  font=new FTGLPixmapFont(fontname);
  if (font->Error()) { 
    errmsg = "Cannot create Freetype font";
    delete font;
    font = NULL;
  } else {
    unsigned int size = 16*cex + 0.5;
    if (size<1) { size=1; }
    if (!font->FaceSize(size)) {
      errmsg = "Cannot create Freetype font of requested size";
      delete font;
      font = NULL;
    }
  }
/*  font->CharMap(ft_encoding_unicode);
  if (font->Error()) {
    error("Cannot set unicode encoding."); 
  }*/

}

GLFTFont::~GLFTFont()
{
  if (font) delete font;
}

double GLFTFont::width(const char* text) {
  return font->Advance(text);
}

double GLFTFont::width(const wchar_t* text) {
  return font->Advance(text);
}
  
double GLFTFont::height() {
  return font->Ascender();
}

void GLFTFont::draw(const char* text, int length, double adjx, double adjy, const RenderContext& rc) {
  
  if ( justify( width(text), height(), adjx, adjy, rc ) ) {
    if (rc.gl2psActive == GL2PS_NONE)
      font->Render(text);
    else
      gl2psTextOpt(text, GL2PS_FONT, GL2PS_FONTSIZE*cex, gl2ps_centering, 0.0);
  }
}

void GLFTFont::draw(const wchar_t* text, int length, double adjx, double adjy, const RenderContext& rc) {
  if ( justify( width(text), height(), adjx, adjy, rc ) ) {
    if (rc.gl2psActive == GL2PS_NONE) 
      font->Render(text);
  }      
}
      
#endif
