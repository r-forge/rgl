// C++ source
// This file is part of RGL.
//
// $Id: math.cpp,v 1.2.2.2 2004/06/04 07:43:46 dadler Exp $

#include "math.h"

//////////////////////////////////////////////////////////////////////////////
//
// CLASS
//   Vertex
//

void Vec3::normalize()
{
  float len = this->getLength();
  if (len != 0.0f) {
    float f = 1.0f/len;
    x *= f;
    y *= f;
    z *= f;
  }
}

Vec3 Vec3::cross(Vec3 op2) const
{
  Vec3 v;
  v.x = y * op2.z - z * op2.y;
  v.y = z * op2.x - x * op2.z;
  v.z = x * op2.y - y * op2.x;
  return v;
}

Vec3 Vec3::operator * (float s)
{
  Vec3 v;

  v.x = x*s;
  v.y = y*s;
  v.z = z*s;

  return v;
}

float Vec3::operator * (Vec3 v)
{
  return (x*v.x + y*v.y + z*v.z);
}

Vec3 Vec3::operator - (Vec3 op2) const 
{
  Vec3 v;

  v.x = x - op2.x;
  v.y = y - op2.y;
  v.z = z - op2.z;

  return v;
}

void Vec3::operator += (Vec3 op2) 
{
  x += op2.x;
  y += op2.y;
  z += op2.z;
}

Vec3 Vertex::operator + (Vec3 op2) const
{
  Vec3 t(*this);

  t += op2;

  return t;
}

void Vec3::rotateX(float degree)
{
  Vec3 t(*this);

  float rad = deg2radf(degree);
  float s = sinf(rad);
  float c = cosf(rad);

  y = c*t.y + -s*t.z;
  z = s*t.y +  c*t.z;
}

void Vec3::rotateY(float degree)
{
  Vec3 t(*this);

  float rad = deg2radf(degree);
  float s = sinf(rad);
  float c = cosf(rad);

  x =  c*t.x + s*t.z;
  z = -s*t.x + c*t.z;
}

//////////////////////////////////////////////////////////////////////////////
//
// CLASS
//   Vec4
//

Vec4::Vec4(const float in_x, const float in_y, const float in_z, const float in_w)
{
  x = in_x;
  y = in_y;
  z = in_z;
  w = in_w;
}

float Vec4::operator * (const Vec4& v) const
{
  return (x*v.x + y*v.y + z*v.z + w*v.w);
}

Vec4 Vec4::operator * (const float s) const
{
  Vec4 r;

  r.x = x*s;
  r.y = y*s;
  r.z = z*s;
  r.w = w*s;

  return r;
}

Vec4 Vec4::operator + (const Vec4& v) const
{
  return Vec4(x+v.x, y+v.y, z+v.z, w+v.w);
}

//////////////////////////////////////////////////////////////////////////////
//
// CLASS
//   Matrix4x4
//

Matrix4x4::Matrix4x4()
{
}

Matrix4x4::Matrix4x4(const Matrix4x4& src)
{
  for(int i=0;i<16;i++)
    data[i] = src.data[i];
}

Matrix4x4::Matrix4x4(const double* from)
{
  for(int i=0;i<16;i++)
    data[i] = (float) from[i];
}

Vec3 Matrix4x4::operator * (const Vec3 v) const {
  Vec3 r;
  const float v_w = 1.0f;

  r.x = val(0,0) * v.x + val(0,1) * v.y + val(0,2) * v.z + val(0,3) * v_w;
  r.y = val(1,0) * v.x + val(1,1) * v.y + val(1,2) * v.z + val(1,3) * v_w;
  r.z = val(2,0) * v.x + val(2,1) * v.y + val(2,2) * v.z + val(2,3) * v_w;

  return r;
}

Vec4 Matrix4x4::operator*(const Vec4& v) const {

  Vec4 r;

  r.x = val(0,0) * v.x + val(0,1) * v.y + val(0,2) * v.z + val(0,3) * v.w;
  r.y = val(1,0) * v.x + val(1,1) * v.y + val(1,2) * v.z + val(1,3) * v.w;
  r.z = val(2,0) * v.x + val(2,1) * v.y + val(2,2) * v.z + val(2,3) * v.w;
  r.w = val(3,0) * v.x + val(3,1) * v.y + val(3,2) * v.z + val(3,3) * v.w;

  return r;
}


Matrix4x4 Matrix4x4::operator * (const Matrix4x4& op2) const {

  Matrix4x4 r;

  for(int i=0;i<4;i++)
    for(int j=0;j<4;j++) {
      float tmp = 0;

      for(int k=0;k<4;k++)
        tmp += val(i, k) * op2.val(k, j);

      r.ref(i,j) = tmp;
    }

  return r;
}

void Matrix4x4::setIdentity(void) {
  for(int i=0;i<16;i++)
    data[i] = 0.0f;
  ref(0,0) = 1.0f;
  ref(1,1) = 1.0f;
  ref(2,2) = 1.0f;
  ref(3,3) = 1.0f;
}

void Matrix4x4::setRotate(const int axis, const float degree) {
  float rad = deg2radf(degree);
  float s   = sinf(rad);
  float c   = cosf(rad);
  setIdentity();
  switch(axis) {
    case 0:
      ref(1,1) = c;
      ref(1,2) = -s;
      ref(2,1) = s;
      ref(2,2) = c;
      break;
    case 1:
      ref(0,0) = c;
      ref(0,2) = s;
      ref(2,0) = -s;
      ref(2,2) = c;
      break;
    case 2:
      ref(0,0) = c;
      ref(0,1) = -s;
      ref(1,0) = s;
      ref(1,1) = c;
      break;
  }
}

Vertex PolarCoord::vector() const { 
  float t = deg2radf(theta);
  float p = deg2radf(phi);
  return Vertex (
    cosf(p) * sinf(t),
    sinf(p),
    cosf(p) * cosf(t)
  );
}
