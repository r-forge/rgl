#include "PrimitiveSet.hpp"

// ===[ PRIMITIVE SET ]=======================================================

PrimitiveSet::PrimitiveSet (

    Material& in_material, 
    int in_nvertices, 
    double* in_vertices, 
    int in_type, 
    int in_nverticesperelement,
    int in_ignoreExtent

)
  :
Shape(in_material, in_ignoreExtent, SHAPE)
{
  type                = in_type;
  nverticesperelement = in_nverticesperelement;
  nvertices           = in_nvertices;
  nprimitives         = in_nvertices / nverticesperelement;

  material.colorPerVertex(true, nvertices);

  vertexArray.alloc(nvertices);
  hasmissing = false;
  for(int i=0;i<nvertices;i++) {
    vertexArray[i].x = (float) in_vertices[i*3+0];
    vertexArray[i].y = (float) in_vertices[i*3+1];
    vertexArray[i].z = (float) in_vertices[i*3+2];
    boundingBox += vertexArray[i];
    hasmissing |= vertexArray[i].missing();
  }
}

// ---------------------------------------------------------------------------

void PrimitiveSet::drawBegin(RenderContext* renderContext)
{
  material.beginUse(renderContext);
  vertexArray.beginUse();
}

// ---------------------------------------------------------------------------

void PrimitiveSet::drawAll(RenderContext* renderContext)
{
  if (!hasmissing)
    glDrawArrays(type, 0, nverticesperelement*nprimitives );
    // FIXME: refactor to vertexArray.draw( type, 0, nverticesperelement*nprimitives );
  else {
    bool missing = true;
    for (int i=0; i<nprimitives; i++) {
      bool skip = false;
      for (int j=0; j<nverticesperelement; j++) 
        skip |= vertexArray[nverticesperelement*i + j].missing();
      if (missing != skip) {
        missing = !missing;
        if (missing) glEnd();
        else glBegin(type);
      }
      if (!missing) 
        for (int j=0; j<nverticesperelement; j++)
          glArrayElement( nverticesperelement*i + j );
    }
    if (!missing) glEnd();
  }              
}

// ---------------------------------------------------------------------------

void PrimitiveSet::drawElement(RenderContext* renderContext, int index)
{
  if (hasmissing) {
    bool skip = false;
    for (int j=0; j<nverticesperelement; j++) 
      skip |= vertexArray[index*nverticesperelement + j].missing();
    if (skip) return;
  }
  glDrawArrays(type, index*nverticesperelement, nverticesperelement);
  // FIXME: refactor to vertexArray.draw( type, index*nverticesperelement, nverticesperelement );
}

// ---------------------------------------------------------------------------

void PrimitiveSet::drawEnd(RenderContext* renderContext)
{
  vertexArray.endUse();
  material.endUse(renderContext);
}

// ---------------------------------------------------------------------------

void PrimitiveSet::draw(RenderContext* renderContext)
{
  drawBegin(renderContext);

  drawAll(renderContext);

  drawEnd(renderContext);
}

// ---------------------------------------------------------------------------

void PrimitiveSet::renderZSort(RenderContext* renderContext)
{
  // sort by z-depth
  
  std::multimap<float,int> distanceMap;
  for (int index = 0 ; index < nprimitives ; ++index ) {
    float distance = renderContext->getDistance( getCenter(index) );
    distanceMap.insert( std::pair<float,int>(-distance,index) );
  }

  // render ordered

  drawBegin(renderContext);
  
  for ( std::multimap<float,int>::iterator iter = distanceMap.begin(); iter != distanceMap.end() ; ++ iter ) {
    drawElement( renderContext, iter->second );
  }  
  
  drawEnd(renderContext);
}

// ===[ FACE SET ]============================================================

FaceSet::FaceSet(

  Material& in_material, 
  int in_nelements, 
  double* in_vertex, 
  int in_type, 
  int in_nverticesperelement,
  int in_ignoreExtent

)
: PrimitiveSet(in_material, in_nelements, in_vertex, in_type, in_nverticesperelement, in_ignoreExtent)
{
  if (material.lit) {
    normalArray.alloc(nvertices);
    for (int i=0;i<=nvertices-nverticesperelement;i+=nverticesperelement) 
    {   
      if (hasmissing && (vertexArray[i].missing() ||
                         vertexArray[i+1].missing() ||
                         vertexArray[i+2].missing()) )
        normalArray[i] = Vertex(0.0, 0.0, 0.0);
      else
        normalArray[i] = vertexArray.getNormal(i,i+1,i+2);
      for (int j=1;j<nverticesperelement;++j)    
        normalArray[i+j] = normalArray[i];
    }
  }
}


// ---------------------------------------------------------------------------

void FaceSet::drawBegin(RenderContext* renderContext)
{  
  PrimitiveSet::drawBegin(renderContext);

  if (material.lit)
    normalArray.beginUse();
}

// ---------------------------------------------------------------------------

void FaceSet::drawEnd(RenderContext* renderContext)
{  
  if (material.lit)
    normalArray.endUse();

  PrimitiveSet::drawEnd(renderContext);
}
