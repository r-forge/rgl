#include "SpriteSet.hpp"

//////////////////////////////////////////////////////////////////////////////
//
// CLASS
//   SpriteSet
//

SpriteSet::SpriteSet(Material& in_material, int in_nvertex, double* in_vertex, int in_nsize, double* in_size)
 : Shape(in_material), 
  vertex(in_nvertex, in_vertex),
   size(in_nsize, in_size)
{ 
  material.colorPerVertex(false);

  for(int i=0;i<vertex.size();i++)
    boundingBox += Sphere( vertex.get(i), size.getRecycled(i) );
}

SpriteSet::~SpriteSet()
{ }

void SpriteSet::render(RenderContext* renderContext)
{ 
  double mdata[16] = { 0 };

  glGetDoublev(GL_MODELVIEW_MATRIX, mdata);

  Matrix4x4 m(mdata);

  material.beginUse(renderContext);
  
  glPushMatrix();

  glLoadIdentity();
  
  bool doTex = (material.texture) ? true : false;

  glNormal3f(0.0f,0.0f,1.0f);

  glBegin(GL_QUADS);
  for(int i=0;i<vertex.size();i++) {

    Vertex& o = vertex.get(i);
    float   s = size.getRecycled(i) * 0.5f;
    Vertex  v;

    v = m * o;

    material.useColor(i);

    if (doTex)
      glTexCoord2f(0.0f,0.0f);
    glVertex3f(v.x - s, v.y - s, v.z);

    if (doTex)
      glTexCoord2f(1.0f,0.0f);
    glVertex3f(v.x + s, v.y - s, v.z);

    if (doTex)
      glTexCoord2f(1.0f,1.0f);
    glVertex3f(v.x + s, v.y + s, v.z);

    if (doTex)
      glTexCoord2f(0.0f,1.0f);
    glVertex3f(v.x - s, v.y + s, v.z);

  }
  glEnd();

  glPopMatrix();

  material.endUse(renderContext);
}

void SpriteSet::draw(RenderContext* renderContext)
{ 
}


