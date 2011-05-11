#ifndef RGL_COLOR_ARRAY_HPP
#define RGL_COLOR_ARRAY_HPP

#include "Color.hpp"

class ColorArray
{
public:
  ColorArray();
  ColorArray( ColorArray& src );
  ColorArray( Color& bg, Color& fg );
  ~ColorArray();
//  void set( int ncolor, RColor* rcolors, u8 alpha=255 );
  void set( int ncolor, char** colors, int nalpha, double* alphas );
  void set( int ncolor, int* colors, int nalpha, double* alphas );
  void useColor( int index ) const;
  void useArray() const;
  unsigned int getLength() const;
  Color getColor( int index ) const;
  void recycle( unsigned int newsize );
  bool hasAlpha() const;
private:
  bool         hint_alphablend;
  unsigned int ncolor;
  unsigned int nalpha;
  u8*          arrayptr;
  friend class Material;
};

#endif // RGL_COLOR_ARRAY_HPP

