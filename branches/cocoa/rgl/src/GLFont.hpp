#ifndef RGL_GL_FONT_HPP
#define RGL_GL_FONT_HPP

#include "opengl.hpp"
#include "rendercontext.hpp"
#include <vector>

class GLFont;

typedef std::vector<GLFont*> FontArray;

#define GL2PS_FONT 	"Helvetica"
#define GL2PS_FONTSIZE 	12
#define GL2PS_SCALING   0.8
#define GL2PS_NONE	 0
#define GL2PS_LEFT_ONLY	 1
#define GL2PS_POSITIONAL 2


class GLFont
{
public:
  GLFont(const char* in_family, int in_style, double in_cex, 
         const char* in_fontname, bool in_useFreeType):
  style(in_style), cex(in_cex), useFreeType(in_useFreeType) 
  {
    family = new char[strlen(in_family) + 1];
    memcpy(family, in_family, strlen(in_family) + 1);
    fontname = new char[strlen(in_fontname) + 1];
    memcpy(fontname, in_fontname, strlen(in_fontname) + 1);    
  };
  
  ~GLFont()
  {
    delete [] family;
    delete [] fontname;
  }
  
  virtual void   draw(const char*    text, int length, double adjx, double adjy, const RenderContext& rc) = 0;
  virtual void   draw(const wchar_t* text, int length, double adjx, double adjy, const RenderContext& rc) = 0;
  virtual double width(const char* text) = 0;
  virtual double width(const wchar_t* text) = 0;
  virtual double height() = 0;
  // justify returns false if justification puts the text outside the viewport
  GLboolean justify(double width, double height, double adjx, double adjy, const RenderContext& rc);
  char const * getFamily() { return family; }
  int          getStyle()  { return style;  }
  double       getCEX()    { return cex;    }
  bool         isFreeType() { return useFreeType; }
  char const * getFontName() { return fontname; }
// protected:
  char*   family;
  int     style;
  double  cex;
  char*   fontname;
  bool    useFreeType;
  int     gl2ps_centering;
};

#endif // RGL_GL_FONT_HPP

