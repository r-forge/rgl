#ifndef GEOM_HPP
#define GEOM_HPP

#include "math.h"

//
// CLASS
//   AABox (axis-aligned box)
//

class Sphere;

class AABox {
public:
  AABox();
  void invalidate(void);
  bool isValid(void) const;
  void operator += (const AABox& aabox);
  void operator += (const Sphere& sphere);
  void operator += (const Vertex& vertex);
  Vertex getCenter(void) const;
  Vertex vmin, vmax;
};


//
// CLASS
//   Sphere
//

class Sphere {
public:
  Sphere() : center(0,0,0), radius(1) {};
  Sphere(const Vertex& center, const float radius);
  Sphere(const float radius);
  Sphere(const AABox& aabox);
  Vertex center;
  float radius;
};


//
// CLASS
//   Frustum
//

class Frustum {
public:
  void enclose(float sphere_radius, float fovangle, RectSize& winsize);
  float left, right, bottom, top, znear, zfar, distance;
};




#endif // GEOM_HPP
