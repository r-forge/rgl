#include "ColorArray.hpp"
#include "opengl.hpp"
#include <cstring> // for memcpy
#include <cstdlib>

ColorArray::ColorArray() 
{
  arrayptr = NULL;
  ncolor   = 0;
  nalpha   = 0;
}

ColorArray::ColorArray( Color& bg, Color &fg )
{
  ncolor   = 2;
  nalpha   = 2;
  arrayptr = (u8*) realloc( NULL, sizeof(u8) * 4 * ncolor);
  arrayptr[0] = bg.getRedub();
  arrayptr[1] = bg.getBlueub();
  arrayptr[2] = bg.getGreenub();
  arrayptr[3] = bg.getAlphaub();
  arrayptr[4] = fg.getRedub();
  arrayptr[5] = fg.getBlueub();
  arrayptr[6] = fg.getGreenub();
  arrayptr[7] = fg.getAlphaub();
  hint_alphablend = ( (bg.getAlphaub() < 255) || (fg.getAlphaub() < 255) ) ? true : false;
}

ColorArray::ColorArray( ColorArray& src ) {
  ncolor = src.ncolor;
  nalpha = src.nalpha;
  hint_alphablend = src.hint_alphablend;
  if (ncolor > 0) {
    arrayptr = (u8*) realloc( NULL, sizeof(u8) * 4 * ncolor);
    memcpy( arrayptr, src.arrayptr, sizeof(u8) * 4 * ncolor);
  } else {
    arrayptr = NULL;
  }
}

ColorArray::~ColorArray() {
  if (arrayptr)
    free(arrayptr);
}

void ColorArray::set( int in_ncolor, char** in_color, int in_nalpha, double* in_alpha)
{
  ncolor  = getMax(in_ncolor, in_nalpha);
  nalpha  = in_nalpha;
  u8* ptr = arrayptr = (u8*) realloc( arrayptr, sizeof(u8) * 4 * ncolor);

  hint_alphablend = false;

  for (unsigned int i=0;i<ncolor;i++) {
    StringToRGB8(in_color[i%in_ncolor], ptr);
    if (in_nalpha > 0) {
      u8 alpha = (u8) ( clamp( (float) in_alpha[i%in_nalpha], 0.0f, 1.0f) * 255.0f );
      if (alpha < 255)
        hint_alphablend = true;
      ptr[3] = alpha;
    } else
      ptr[3] = 0xFF;
    ptr += 4;
  }
}

void ColorArray::set( int in_ncolor, int* in_color, int in_nalpha, double* in_alpha)
{
  ncolor  = getMax(in_ncolor, in_nalpha);
  nalpha  = in_nalpha;
  u8* ptr = arrayptr = (u8*) realloc( arrayptr, sizeof(u8) * 4 * ncolor);

  hint_alphablend = false;

  for (unsigned int i=0;i<ncolor;i++) {
    int base = (i%in_ncolor) * 3;
    ptr[0] = (u8) in_color[base];
    ptr[1] = (u8) in_color[base+1];
    ptr[2] = (u8) in_color[base+2];
    if (in_nalpha > 0) {
      u8 alpha = (u8) ( clamp( (float) in_alpha[i%in_nalpha], 0.0f, 1.0f) * 255.0f );
      if (alpha < 255)
        hint_alphablend = true;
      ptr[3] = alpha;
    } else
      ptr[3] = 0xFF;
    ptr += 4;    
  }
}

unsigned int ColorArray::getLength() const
{
  return ncolor;
}

bool ColorArray::hasAlpha() const
{
  return hint_alphablend;
}

void ColorArray::useArray() const
{
  glColorPointer(4, GL_UNSIGNED_BYTE, 0, (const GLvoid*) arrayptr );
}

void ColorArray::useColor(int index) const
{
  glColor4ubv( (const GLubyte*) &arrayptr[ index * 4] );
}

Color ColorArray::getColor(int index) const
{
  return Color( arrayptr[index*4], arrayptr[index*4+1], arrayptr[index*4+2], arrayptr[index*4+3] );
}

void ColorArray::recycle(unsigned int newsize)
{
  if (ncolor != newsize) {
    if (ncolor > 1) {

      if (newsize > 0) {
        arrayptr = (u8*) realloc(arrayptr, sizeof(u8)*4*newsize);

        for(unsigned int i=ncolor;i<newsize;i++) {
          int m = (i % ncolor)*4;
          arrayptr[i*4+0] = arrayptr[ m + 0];
          arrayptr[i*4+1] = arrayptr[ m + 1];
          arrayptr[i*4+2] = arrayptr[ m + 2];
          arrayptr[i*4+3] = arrayptr[ m + 3];
        }
      } else 
        arrayptr = NULL;

      ncolor = newsize;
    }
  }
}


