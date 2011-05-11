#include "GLBitmapFont.hpp"
#include "gl2ps.h"
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
  for(int i=0; text[i]; i++)
    result += widths[(text[i]-firstGlyph)];
  return result;
}

double GLBitmapFont::width(const wchar_t* text) {
  double result = 0.0;
  for(int i=0; text[i]; i++)
    result += widths[(text[i]-firstGlyph)];
  return result;
}
  
double GLBitmapFont::height() {
  return ascent;
}

void GLBitmapFont::draw(const char* text, int length, 
                        double adjx, double adjy, const RenderContext& rc) {
    
  if (justify(width(text), height(), adjx, adjy, rc)) {
  
    if (rc.gl2psActive == GL2PS_NONE) {
      glListBase(listBase);
      glCallLists(length, GL_UNSIGNED_BYTE, text);
    } else
      gl2psTextOpt(text, GL2PS_FONT, GL2PS_FONTSIZE, gl2ps_centering, 0.0);
  }
}

void GLBitmapFont::draw(const wchar_t* text, int length, 
                        double adjx, double adjy, const RenderContext& rc) {
  
  if (justify(width(text), height(), adjx, adjy, rc)) {
  
    if (rc.gl2psActive == GL2PS_NONE) {
      glListBase(listBase);
      glCallLists(length, GL_UNSIGNED_BYTE, text);
    }
  // gl2ps doesn't support wchar_t?  Should convert?
  }
}
