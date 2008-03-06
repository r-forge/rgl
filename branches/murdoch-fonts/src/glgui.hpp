#ifndef GL_GUI_H
#define GL_GUI_H

// C++ header
// This file is part of rgl
//
// $Id$

#include "opengl.hpp"
#include <vector>

// CLASS
//   GLFont
//

class GLFont
{
public:
  GLFont(const char* in_family, int in_style, double in_cex):
  style(in_style), cex(in_cex) 
  {
    family = new char[strlen(in_family) + 1];
    memcpy(family, in_family, strlen(in_family) + 1);
  };
  
  ~GLFont()
  {
    delete [] family;
  }
  
  virtual void draw(char* text, int length, double adj, int gl2psActive) = 0;

  char* family;
  int style;
  double cex;
};

#define GL_BITMAP_FONT_FIRST_GLYPH  32
#define GL_BITMAP_FONT_LAST_GLYPH   127
#define GL_BITMAP_FONT_COUNT       (GL_BITMAP_FONT_LAST_GLYPH-GL_BITMAP_FONT_FIRST_GLYPH+1)

#define GL2PS_FONT 	"Helvetica"
#define GL2PS_FONTSIZE 	12
#define GL2PS_SCALING   0.8

#define GL2PS_NONE	 0
#define GL2PS_LEFT_ONLY	 1
#define GL2PS_POSITIONAL 2

//
// CLASS
//   GLBitmapFont
//

class GLBitmapFont : public GLFont
{
public:
  // Most initialization of this object is done by the system-specific driver
  GLBitmapFont(const char* in_family, int in_style, double in_cex): 
    GLFont(in_family, in_style, in_cex) {};
  ~GLBitmapFont();

  void draw(char* text, int length, double adj, int gl2psActive);
  
  GLuint listBase;
  GLuint firstGlyph;
  GLuint nglyph;
  unsigned int* widths;
};

#ifdef HAVE_FREETYPE
//
// CLASS
//   GLFTFont
//

class GLFTFont : public GLFont
{
public:
  GLFTFont(const char* in_family, int in_style, double in_cex);
  
  ~GLFTFont();

  void draw(char* text, int length, double adj, int gl2psActive);
  
  FTFont *font;
};
#endif

/**
 * FontArray
 **/
typedef std::vector<GLFont*> FontArray;


#endif /* GL_GUI_H */

