#ifndef RGL_FACE_SET_HPP
#define RGL_FACE_SET_HPP

#include "PrimitiveSet.hpp"

class FaceSet : public PrimitiveSet
{
public:
  virtual void drawBegin(RenderContext* renderContext); // overload
  virtual void drawEnd(RenderContext* renderContext); // overload
  virtual void getShapeName(char* buffer, int buflen) { strncpy(buffer, "faces", buflen); }; //overload
protected:
  FaceSet(Material& in_material, int in_nelements, 
    double* in_vertex,
    double* in_normals,
    double* in_texcoords,
    int in_type, 
    int in_nverticesperelement,
    bool in_ignoreExtent,
    int in_useNormals,
    int in_useTexcoords,
    bool in_bboxChange = false
  );
  
  FaceSet(
    Material& in_material, 
    int in_type, 
    int in_verticesperelement,
    bool in_ignoreExtent,
    bool in_bboxChange = false
  );
  
  /* (re-)set mesh */
  void initFaceSet(int in_nelements, double* in_vertex, double* in_normals, double* in_texcoords);
 
  NormalArray   normalArray;
  TexCoordArray texCoordArray;
};

#endif // RGL_FACE_SET_HPP 

