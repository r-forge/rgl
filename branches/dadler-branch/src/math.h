#ifndef RGL_MATH_H
#define RGL_MATH_H

// C++ header file
// This file is part of RGL
//
// $Id: math.h,v 1.4.4.1 2004/05/29 10:43:33 dadler Exp $

#include <math.h>
#include <float.h>


#include "types.h"

#ifndef PI
#define PI      3.1415926535897932384626433832795
#endif

/*
#ifndef sinf
#define sinf(X) sin(X)
#define cosf(X) cos(X)
#define asinf(X) asin(X)
#define acosf(X) acos(X)
#define tanf(X) tan(X)
#define sqrtf(X) sqrt(X)
#endif
 */

inline float deg2radf(float deg) { return ((float)(PI/180.0)) * deg; }
inline float rad2degf(float rad) { return rad / ((float)(PI/180.0)); }

struct Vertex
{
  Vertex() {};
  Vertex(float x,float y, float z);
  float getLength() const;
  void normalize();
  Vertex cross(Vertex op2) const;
  float operator * (Vertex op2);
  Vertex operator * (float value);
  Vertex operator+(Vertex op2) const;
  Vertex operator-(Vertex op2) const;
  void   operator+=(Vertex op2);
  void   rotateX(float degree);
  void   rotateY(float degree);
  float x,y,z;
};

template<>
inline void copy(double* from, Vertex* to, int size)
{
  copy(from, (float*) to, size*3);
}

typedef Vertex  Vertex3;
typedef Vertex3 Normal;


struct Vertex4
{
  Vertex4(const Normal& n) : x(n.x), y(n.y), z(n.z), w(0.0f) {};
  Vertex4() {};
  Vertex4(const float x, const float y, const float z, const float w=1.0f);
  float operator * (const Vertex4& op2) const;
  Vertex4 operator * (const float value) const;
  Vertex4 operator + (const Vertex4& op2) const;
  float x,y,z,w;
};

class Matrix4x4
{
public:
  Matrix4x4();
  Matrix4x4(const Matrix4x4& src);
  Matrix4x4(const double*);
  Vertex operator*(Vertex op2) const;
  Vertex4 operator*(const Vertex4& op2) const;
  Matrix4x4 operator*(const Matrix4x4& op2) const;
  void setIdentity(void);
  void setRotate(int axis, float degree);
private:
  inline float  val(int row, int column) const { return data[4*column+row]; }
  inline float& ref(int row, int column) { return data[4*column+row]; }
  float data[16];
};


//
// CLASS
//   RectSize
//

struct RectSize
{
  RectSize() : width(0), height(0) {};
  RectSize(int in_width, int in_height) : width(in_width), height(in_height) {};
  int width;
  int height;
};


//
// CLASS
//   PolarCoord
//

struct PolarCoord
{
  PolarCoord(float in_theta=0.0f, float in_phi=0.0f) : theta(in_theta), phi(in_phi) {};
  PolarCoord(const PolarCoord& src) : theta(src.theta), phi(src.phi) {};
  PolarCoord operator + (const PolarCoord& op2) const { return PolarCoord(theta+op2.theta, phi+op2.phi); }
  PolarCoord operator - (const PolarCoord& op2) const { return PolarCoord(theta-op2.theta, phi-op2.phi); }
  float theta;
  float phi;
};



#endif /* MATH_H */
