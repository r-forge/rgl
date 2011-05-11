#ifndef RGL_TRIANGLE_SET_HPP
#define RGL_TRIANGLE_SET_HPP

#include "FaceSet.hpp"

class TriangleSet : public FaceSet
{ 
public:
  TriangleSet(Material& in_material, int in_nvertex, double* in_vertex, double* in_normals,
              double* in_texcoords, bool in_ignoreExtent, int in_useNormals, int in_useTexcoords, bool in_bboxChange = false)
    : FaceSet(in_material,in_nvertex, in_vertex, in_normals, in_texcoords, 
              GL_TRIANGLES, 3, in_ignoreExtent, in_useNormals, in_useTexcoords, in_bboxChange)
  { }
  TriangleSet(Material& in_material, bool in_ignoreExtent, bool in_bboxChange) : 
    FaceSet(in_material, GL_TRIANGLES, 3, in_ignoreExtent, in_bboxChange) 
  { }
  virtual void getShapeName(char* buffer, int buflen) { strncpy(buffer, "triangles", buflen); }; // overload
};

#endif // RGL_TRIANGLE_SET_HPP

