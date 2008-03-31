// C++ source
// This file is part of RGL.
//
// $Id$

#include "types.h"
#include "glgui.hpp"
#include "gl2ps.h"
#include "opengl.hpp"
#include "RenderContext.hpp"

//
// CLASS
//   GLBitmapFont
//

GLBitmapFont::~GLBitmapFont() {
    delete [] widths;
    if (nglyph) glDeleteLists(listBase+GL_BITMAP_FONT_FIRST_GLYPH, nglyph);
};
  
void GLBitmapFont::draw(const char* text, int length, double adj, const RenderContext& rc) {
  
  int centering = GL2PS_TEXT_BL;
  
  if (adj > 0) {
    unsigned int textWidth = 0;
    double base = 0.0;
    double scaling = 1.0;

    if (rc.gl2psActive > GL2PS_NONE) scaling = GL2PS_SCALING;
     
    if ( adj > 0.25 && rc.gl2psActive == GL2PS_POSITIONAL) {
      if (adj < 0.75) {
        base = 0.5;
        centering = GL2PS_TEXT_B;
      } else {
        base = 1.0;
        centering = GL2PS_TEXT_BR;
      }
    }
    if (adj != base) {
      for(int i=0;i<length;i++)
        textWidth += widths[(text[i]-firstGlyph)];

      glBitmap(0,0, 0.0f,0.0f, (float)(scaling * textWidth * (base - adj)), 0.0f, NULL);
    }
  }
  if (rc.gl2psActive == GL2PS_NONE) {
    glListBase(listBase);
    glCallLists(length, GL_UNSIGNED_BYTE, text);
  } else
    gl2psTextOpt(text, GL2PS_FONT, GL2PS_FONTSIZE, centering, 0.0);
}

void GLBitmapFont::draw(const wchar_t* text, int length, double adj, const RenderContext& rc) {
  
  if (adj > 0) {
    unsigned int textWidth = 0;
    double base = 0.0;
    double scaling = 1.0;

    if (adj != base) {
      for(int i=0;i<length;i++)
        textWidth += widths[(text[i]-firstGlyph)];

      glBitmap(0,0, 0.0f,0.0f, (float)(scaling * textWidth * (base - adj)), 0.0f, NULL);
    }
  }
  if (rc.gl2psActive == GL2PS_NONE) {
    glListBase(listBase);
    glCallLists(length, GL_UNSIGNED_SHORT, text);
  }
  // gl2ps doesn't support wchar_t?  Should convert?
}

#ifdef HAVE_FREETYPE

#include "FTGLOutlineFont.h"
#include "FTGLPolygonFont.h"
#include "FTGLBitmapFont.h"
#include "FTGLTextureFont.h"
#include "FTGLPixmapFont.h"
#include "R.h"

GLFTFont::GLFTFont(const char* in_family, int in_style, double in_cex, const char* in_fontname) 
: GLFont(in_family, in_style, in_cex, in_fontname, true)
{
  font=new FTGLPixmapFont(fontname);
  if (font->Error()) { 
    error("Cannot create font, error code: %i.", 
	  font->Error());
  }
  double size = 16*cex + 0.5;
  if (size<1) { size=1; }
  if (!font->FaceSize(size)) {
    error("Cannot create font of size %f.", size);
  }
/*  font->CharMap(ft_encoding_unicode);
  if (font->Error()) {
    error("Cannot set unicode encoding."); 
  }*/

}

void GLFTFont::justify(double adv, double adj, const RenderContext& rc) {
  GLdouble pos[4], pos2[4];
  float base = 0.0;

  glGetDoublev(GL_CURRENT_RASTER_POSITION, pos);    
  pos[0] = pos[0] - adv*(adj-base); 
  gluUnProject( pos[0], pos[1], pos[2], rc.modelview, rc.projection, rc.viewport, pos2, pos2 + 1, pos2 + 2);
  glRasterPos3dv(pos2);
}

void GLFTFont::draw(const char* text, int length, double adj, const RenderContext& rc) {
  double base = 0;
  if (adj != base) {
    GLboolean valid; 
    justify( font->Advance(text), adj, rc );
    glGetBooleanv(GL_CURRENT_RASTER_POSITION_VALID, &valid);
    if (!valid) return;
  }
  font->Render(text);
}

void GLFTFont::draw(const wchar_t* text, int length, double adj, const RenderContext& rc) {
  double base = 0;
  if (adj != base) {
    GLboolean valid; 
    justify( font->Advance(text), adj, rc );
    glGetBooleanv(GL_CURRENT_RASTER_POSITION_VALID, &valid);
    if (!valid) return;
  }
  font->Render(text);
}
      
#endif
