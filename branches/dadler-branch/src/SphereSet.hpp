#ifndef SPHERESET_HPP
#define SPHERESET_HPP

#include "Shape.hpp"
#include "SphereMesh.hpp"

class SphereSet : public Shape {
private:
  ARRAY<Vertex> center;
  ARRAY<float>  radius;
  SphereMesh    sphereMesh;
/*
  int nsphere;
  VertexArray center;

  int nradius;
  union radiusInfo {
    float* arrayptr;
    float  value;
  } radius;
*/
public:
  SphereSet(Material& in_material, int nsphere, double* center, int nradius, double* radius);
  ~SphereSet();
  void draw(RenderContext* renderContext);
};

#endif // SPHERESET_HPP
