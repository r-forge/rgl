#ifndef GL_BITMAP_FONT_HPP
#define GL_BITMAP_FONT_HPP

#include "GLFont.hpp"

#define GL_BITMAP_FONT_FIRST_GLYPH  32
#define GL_BITMAP_FONT_LAST_GLYPH   127
#define GL_BITMAP_FONT_COUNT       (GL_BITMAP_FONT_LAST_GLYPH-GL_BITMAP_FONT_FIRST_GLYPH+1)


class GLBitmapFont : public GLFont
{
public:
  // Most initialization of this object is done by the system-specific driver
  GLBitmapFont(const char* in_family, int in_style, double in_cex, const char* in_fontname): 
    GLFont(in_family, in_style, in_cex, in_fontname, false) {};
  ~GLBitmapFont();

  void draw(const char* text, int length, double adjx, double adjy, const RenderContext& rc);
  void draw(const wchar_t* text, int length, double adjx, double adjy, const RenderContext& rc); 
  double width(const char* text);
  double width(const wchar_t* text);
  double height();
 private: 
  GLuint listBase;
  GLuint firstGlyph;
  GLuint nglyph;
  unsigned int* widths;
  unsigned int ascent;
};

#endif // GL_BITMAP_FONT_HPP

