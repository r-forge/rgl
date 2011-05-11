#ifndef RGL_COLOR_HPP
#define RGL_COLOR_HPP

//
// CLASS
//   Color
//
// IMPLEMENTATION
//   uses floats as the general format for single colors, clear colors,
//   lighting and material color properties
//

#include "types.h"

class Color
{
public:
  Color();
  Color(float red, float green, float blue, float alpha=1.0f);
  Color(u8 red, u8 green, u8 blue, u8 alpha);
  Color(const char* string);
  float  getRedf()   const { return data[0]; }
  float  getGreenf() const { return data[1]; }
  float  getBluef()  const { return data[2]; }
  float  getAlphaf() const { return data[3]; }
  u8     getRedub()  const { return (u8) (data[0]*255.0f); }
  u8     getGreenub()const { return (u8) (data[1]*255.0f); }
  u8     getBlueub() const { return (u8) (data[2]*255.0f); }
  u8     getAlphaub()const { return (u8) (data[3]*255.0f); }
  float* getFloatPtr() const { return (float*) data; }
  /// set by integer ptr
  void   set3iv(int* color);
  void useClearColor() const;
  void useColor() const;
  float data[4];
};

void StringToRGB8(const char* string, u8* colorptr);

#endif // RGL_COLOR_HPP

