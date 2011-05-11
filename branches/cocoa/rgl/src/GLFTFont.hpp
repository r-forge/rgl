#ifndef RGL_GL_FT_FONT_HPP
#define RGL_GL_FT_FONT_HPP

#include "GLFont.hpp"

#ifdef HAVE_FREETYPE
#include "FTGL/ftgl.h"
#endif

class GLFTFont : public GLFont
{
public:
  GLFTFont(const char* in_family, int in_style, double in_cex, const char* in_fontname);
  
  ~GLFTFont();
#ifdef HAVE_FREETYPE
  void draw(const char* text, int length, double adjx, double adjy, const RenderContext& rc);
  void draw(const wchar_t* text, int length, double adjx, double adjy, const RenderContext& rc);
  double width(const char* text);
  double width(const wchar_t* text);
  double height();
private:  
  FTFont *font;
  const char *errmsg;
#endif
};

#endif // RGL_GL_FT_FONT_HPP 

