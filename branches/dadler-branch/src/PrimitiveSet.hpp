#ifndef PRIMITIVE_SET_HPP
#define PRIMITIVE_SET_HPP

#include "Shape.hpp"

#include "render.h"

#include <map>

#if 0
class ElementSet : public Shape {
  ElementSet(int type, int nverticesper) {
  }
  void renderBegin()
  {
  }
  void renderElement(int index)
  {
    glDrawArrays(type,index,1);
  }
  void renderRange(int index0, int index1)
  {
    glDrawArrays(type,index0,index1-index0+1);
  }
  void renderEnd()
  {
  }
  Vertex getCenter(int index)
  {    
  }
  virtual void renderZSorted(RenderContext* renderContext)
  {
    Vertex cop = renderContext->cop;
  
    std::multimap<float,int> distanceMap;
    for (int index = 0 ; index < nelements ; ++index ) {
      float distance = ( getCenter(index) - cop ).getLength();
      distanceMap.insert( std::pair<float,int>(-distance,index) );
    }

    drawBegin(renderContext);
    for ( std::multimap<float,int>::iterator iter = distanceMap.begin(); iter != distanceMap.end() ; ++ iter ) {
      drawElement( renderContext, iter->second );
    }  
    drawEnd(renderContext);
  }
}
#endif

//
// ABSTRACT CLASS
//   PrimitiveSet
//

class PrimitiveSet : public Shape {
public:
  /**
   * overloaded
   **/
  virtual void draw(RenderContext* renderContext)
  {
    drawBegin(renderContext);
    drawAll(renderContext);
    drawEnd(renderContext);
  }
  /**
   * overloaded
   **/
  virtual void renderZSort(RenderContext* renderContext)
  {
    Vertex cop = renderContext->cop;
  
    std::multimap<float,int> distanceMap;
    for (int index = 0 ; index < nprimitives ; ++index ) {
      float distance = ( getCenter(index) - cop ).getLength();
      distanceMap.insert( std::pair<float,int>(-distance,index) );
    }

    drawBegin(renderContext);
    for ( std::multimap<float,int>::iterator iter = distanceMap.begin(); iter != distanceMap.end() ; ++ iter ) {
      drawElement( renderContext, iter->second );
    }  
    drawEnd(renderContext);
  }
protected:

  PrimitiveSet (

      Material& in_material, 
      int in_nvertices, 
      double* vertex, 
      int in_type, 
      int in_nverticesperelement

  )
    :
  Shape(in_material)
  {
    type                = in_type;
    nverticesperelement = in_nverticesperelement;
    nvertices           = in_nvertices;
    nprimitives         = in_nvertices / nverticesperelement;

    material.colorPerVertex(true, nvertices);

    vertexArray.alloc(nvertices);
    for(int i=0;i<nvertices;i++) {
      vertexArray[i].x = (float) vertex[i*3+0];
      vertexArray[i].y = (float) vertex[i*3+1];
      vertexArray[i].z = (float) vertex[i*3+2];
      boundingBox += vertexArray[i];
    }
  }

  Vertex getCenter(int index)
  {
    Vertex accu;
    int begin = index*nverticesperelement;
    int end   = begin+nverticesperelement;
    for (int i = begin ; i < end ; ++i )
      accu += vertexArray[i];
    return accu * ( 1.0f / ( (float) nverticesperelement ) );
  }

  virtual void drawBegin(RenderContext* renderContext)
  {
    material.beginUse(renderContext);
    vertexArray.beginUse();
  }

  virtual void drawAll(RenderContext* renderContext)
  {
    glDrawArrays(type, 0, nverticesperelement*nprimitives );
  }

  virtual void drawElement(RenderContext* renderContext, int index)
  {
    glDrawArrays(type, index*nverticesperelement, nverticesperelement);
  }

  virtual void drawEnd(RenderContext* renderContext)
  {
    vertexArray.endUse();
    material.endUse(renderContext);
  }

  int type;
  int nverticesperelement;
  int nvertices;
  int nprimitives;
  VertexArray vertexArray;

};

class PointSet : public PrimitiveSet
{ 
public:
  PointSet(Material& material, int nvertices, double* vertices)
    : PrimitiveSet(material, nvertices, vertices, GL_POINTS, 1)
  { }
};

class LineSet : public PrimitiveSet
{ 
public:
  LineSet(Material& material, int nvertices, double* vertices)
    : PrimitiveSet(material, nvertices, vertices, GL_LINES, 2)
  { }
};

//
// ABSTRACT CLASS
//   FaceSet
//

class FaceSet : public PrimitiveSet
{
protected:
  /**
   * Constructor
   **/
  FaceSet(Material& in_material, int in_nelements, double* in_vertex, int in_type, int in_nverticesperelement)
  : PrimitiveSet(in_material, in_nelements, in_vertex, in_type, in_nverticesperelement)
  {
    if (material.lit) {
      normalArray.alloc(nvertices);
      for (int i=0;i<=nvertices-nverticesperelement;i+=nverticesperelement) {
        normalArray[i+3] = normalArray[i+2] = normalArray[i+1] = normalArray[i] = vertexArray.getNormal(i,i+1,i+2);
      }
    }
  }

  virtual void drawBegin(RenderContext* renderContext) {
    
    PrimitiveSet::drawBegin(renderContext);

    if (material.lit)
      normalArray.beginUse();
  }

  virtual void drawEnd(RenderContext* renderContext) {
    
    if (material.lit)    
      normalArray.endUse();

    PrimitiveSet::drawEnd(renderContext);

  }

  NormalArray normalArray;
};

class TriangleSet : public FaceSet
{ 
public:
  TriangleSet(Material& material, int in_nvertex, double* in_vertex)
    : FaceSet(material,in_nvertex, in_vertex, GL_TRIANGLES, 3)
  { }
};

class QuadSet : public FaceSet
{ 
public:
  QuadSet(Material& material, int in_nvertex, double* in_vertex)
    : FaceSet(material,in_nvertex,in_vertex, GL_QUADS, 4)
  { }
};


#endif // PRIMITIVE_SET_HPP
