#include "PrimitiveSet.hpp"

#if 0

void PrimitiveSet::renderZSort(RenderContext* renderContext)
{
  Vertex cop = renderContext->cop;
  
  std::multimap<float,int> distanceMap;
  for (int index = 0 ; i < nelements ; ++index ) {
    float distance = getCenter(index) - cop;
    insert( std::pair<float,int>(distance,index)
  }

  drawBegin();
  for ( std::multimap<float,int>::iterator iter = distanceMap.begin(); iter != distanceMap.end() ; ++ iter ) {
    drawElement( iter->second );
  }  
  drawEnd();
}

//////////////////////////////////////////////////////////////////////////////
//
// CLASS
//   PrimitveSet
//

PrimitiveSet::PrimitiveSet(Material &in_material, GLenum in_type, int in_nvertex, double* vertex, int in_verticesPerElement)
: Shape(in_material), nverticesPerElement(in_verticesPerElement)
{
  type = in_type;

  nvertices = in_nvertex;
  nelements = in_nvertex / N_VERTICES_PER_ELEMENT;

  material.colorPerVertex(true, nelements);

  vertexArray.alloc(nvertices);
  for(int i=0;i<nvertices;i++) {
    vertexArray[i].x = (float) vertex[i*3+0];
    vertexArray[i].y = (float) vertex[i*3+1];
    vertexArray[i].z = (float) vertex[i*3+2];
    boundingBox += vertexArray[i];
  }
}

void PrimitiveSet::drawBegin() {
  material.beginUse(renderContext);
  vertexArray.beginUse();
}

void PrimitiveSet::drawEnd() {
  vertexArray.endUse();
  material.endUse(renderContext);
}

void PrimitiveSet::drawAll() {
  glDrawArrays(GL_PRIMITIVE_TYPE, 0, nelements );
}

void PrimitiveSet::drawElement(int index ) {
  glDrawArrays(type, index*verticesPerIndex, 1);
}

void PrimitiveSet::draw(RenderContext* renderContext) {
  drawBegin();
  drawAll();
  drawEnd();
}

void PrimitiveSet::drawZSort(RenderContext* renderContext) {
  drawZSortBegin();
  drawZSortAll();
  drawZSortEnd();
}


Vertex PrimitiveSet::getCenter(int index)
{
  Vertex accu;
  int begin = index*verticesPerIndex;
  int end   = begin+verticesPerIndex;
  for (int i = begin ; i < end ; ++i )
    accu += vertexArray[i];
  return accu * ( 1.0/verticesPerIndex );
}

#endif 
