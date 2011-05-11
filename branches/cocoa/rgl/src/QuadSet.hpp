//
// CLASS
//   QuadSet
//

class QuadSet : public FaceSet
{ 
public:
  QuadSet(Material& in_material, int in_nvertex, double* in_vertex, double* in_normals,
          double* in_texcoords, bool in_ignoreExtent, int in_useNormals, int in_useTexcoords)
    : FaceSet(in_material,in_nvertex,in_vertex, in_normals, in_texcoords, 
              GL_QUADS, 4, in_ignoreExtent, in_useNormals, in_useTexcoords)
  { }
  
  /**
   * overloaded
   **/  
  virtual void getShapeName(char* buffer, int buflen) { strncpy(buffer, "quads", buflen); };
};


