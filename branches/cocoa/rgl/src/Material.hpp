#ifndef MATERIAL_HPP
#define MATERIAL_HPP

#include "Color.hpp"
#include "Texture.hpp"
#include "RenderContext.hpp"

//
// STRUCT
//   Material
//

class Material {
public:

  enum PolygonMode { 
    FILL_FACE=1, 
    LINE_FACE, 
    POINT_FACE, 
    CULL_FACE 
  };

  Material( Color bg, Color fg );

  void setup();
  // called when complete

  void beginUse(RenderContext* renderContext);
  void endUse(RenderContext* renderContext);
  void useColor(int index);
  void colorPerVertex(bool enable, int numVertices=0);
  bool isTransparent() const { return alphablend; }

  Color        ambient;
  Color        specular;
  Color        emission;
  float        shininess;
  float        size;          // point size
  float        lwd;           // line width
  ColorArray   colors;        // color or if lit, represents diffuse color
  Ref<Texture> texture;
  PolygonMode  front;
  PolygonMode  back;
  bool         alphablend;
  bool         smooth;
  bool         lit;
  bool         fog;
  bool         useColorArray;
  bool         point_antialias;
  bool         line_antialias;
  bool         depth_mask;
  int	       depth_test;  // 0=GL_NEVER, 1=GL_LESS, etc.
  
  float        glVersion;
};



#endif // MATERIAL_HPP
