#ifdef HAVE_FREETYPE
#include "GLFTFont.hpp"

#include "FTGL/ftgl.h"
#include "R.h"
#include "gl2ps.h"

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
      gl2psTextOpt(text, GL2PS_FONT, GL2PS_FONTSIZE, gl2ps_centering, 0.0);
  }
}

void GLFTFont::draw(const wchar_t* text, int length, double adjx, double adjy, const RenderContext& rc) {
  if ( justify( width(text), height(), adjx, adjy, rc ) ) {
    if (rc.gl2psActive == GL2PS_NONE) 
      font->Render(text);
  }      
}
      
#endif
