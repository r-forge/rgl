#ifndef RGL_TEX_COORD_ARRAY_HPP
#define RGL_TEX_COORD_ARRAY_HPP

struct TexCoord
{
  float s,t;
};

class TexCoordArray 
{
public:
   TexCoordArray();
  ~TexCoordArray();

  void      alloc(int nvertex);
  void      beginUse();
  void      endUse();
  TexCoord& operator[](int index);

private:
  float*    arrayptr;
};

#endif // RGL_TEX_COORD_ARRAY_HPP

