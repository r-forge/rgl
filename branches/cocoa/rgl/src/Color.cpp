#include "Color.hpp"
#include "types.h"

// using namespace std;

//
// COLOR UTILS
//

//
// FUNCTION
//   HexCharToNibble
//

u8 HexCharToNibble(char c) {
  u8 nibble = 0;

  if ((c >= '0') && (c <= '9'))
    nibble = c - '0';
  else if (( c >= 'A') && (c <= 'F'))
    nibble = (c - 'A') + 10;
  else if (( c >= 'a') && (c <= 'f'))
    nibble = (c - 'a') + 10;

  return nibble;
}

//
// FUNCTION
//   StringToRGB8
//

void StringToRGB8(const char* string, u8* colorptr) {

  char* strptr = (char*) string;
  int cnt = 0;

  if (( *strptr++ == '#') && (cnt < 3)) {
    char c;

    while( (c = *strptr++) != '\0' ) {
  
      u8 component;

      component = (HexCharToNibble(c) << 4);
      
      if ( (c = *strptr++) == '\0')
        break;

      component |= HexCharToNibble(c);

      *colorptr++ = component; cnt++;
    }
  }

  for(int i=cnt;i<3;i++)
    *colorptr++ = 0x00;
}

//////////////////////////////////////////////////////////////////////////////
//
// CLASS
//   Color
//
//

Color::Color()
{
  data[0] = 1.0f;
  data[1] = 1.0f;
  data[2] = 1.0f;
  data[3] = 1.0f;
}

Color::Color(float red, float green, float blue, float alpha)
{
  data[0] = red;
  data[1] = green;
  data[2] = blue;
  data[3] = alpha;
}

Color::Color(u8 red, u8 green, u8 blue, u8 alpha)
{
  data[0] = ((float)red)/255.0f;
  data[1] = ((float)green)/255.0f;
  data[2] = ((float)blue)/255.0f;
  data[3] = ((float)alpha)/255.0f;
}

Color::Color(const char* string)
{
  u8 tmp[4];

  tmp[3] = 255;

  StringToRGB8(string, tmp);
  for (int i=0;i<4;i++)
    data[i] = ((float)tmp[i])/255.0f;
}

void Color::set3iv(int* color)
{
  data[0] = ((float)color[0])/255.0f;
  data[1] = ((float)color[1])/255.0f;
  data[2] = ((float)color[2])/255.0f;
  data[3] = 1.0f;
}

// TODO: move to rendergl.cpp

#include "opengl.hpp"

void Color::useClearColor() const
{
  glClearColor(data[0],data[1],data[2], data[3]);
}

void Color::useColor() const
{
  glColor4fv(data);
}


