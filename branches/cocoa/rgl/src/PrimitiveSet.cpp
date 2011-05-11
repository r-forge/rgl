#include "PrimitiveSet.hpp"
#include "R.h"

PrimitiveSet::PrimitiveSet (
  Material& in_material, 
  int       in_type,
  int       in_nverticesperelement,
  bool      in_ignoreExtent,
  bool      in_bboxChange
) : Shape(in_material, in_ignoreExtent, SHAPE, in_bboxChange)
{
  type                = in_type;
  nverticesperelement = in_nverticesperelement;
}

// ---------------------------------------------------------------------------

PrimitiveSet::PrimitiveSet (
  Material& in_material, 
  int       in_nvertices, 
  double*   in_vertices, 
  int       in_type, 
  int       in_nverticesperelement,
  bool      in_ignoreExtent,
  bool      in_bboxChange
) : Shape(in_material, in_ignoreExtent, SHAPE, in_bboxChange)
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

void PrimitiveSet::initPrimitiveSet(
  int     in_nvertices, 
  double* in_vertices
) 
{
  nvertices           = in_nvertices;
  nprimitives         = in_nvertices / nverticesperelement;
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
  
/**
 * get primitive center point
 **/
Vertex PrimitiveSet::getCenter(int index)
{
  Vertex accu;
  int begin = index*nverticesperelement;
  int end   = begin+nverticesperelement;
  for (int i = begin ; i < end ; ++i )
    accu += vertexArray[i];
  return accu * ( 1.0f / ( (float) nverticesperelement ) );
}

// ---------------------------------------------------------------------------

void PrimitiveSet::drawBegin(RenderContext* renderContext)
{
  Shape::drawBegin(renderContext);
  material.beginUse(renderContext);
  SAVEGLERROR;
  vertexArray.beginUse();
  SAVEGLERROR;
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
  SAVEGLERROR;
  material.endUse(renderContext);
  SAVEGLERROR;
  Shape::drawEnd(renderContext);
}

// ---------------------------------------------------------------------------

void PrimitiveSet::draw(RenderContext* renderContext)
{
  drawBegin(renderContext);
  SAVEGLERROR;

  drawAll(renderContext);
  SAVEGLERROR;
  
  drawEnd(renderContext);
  SAVEGLERROR;
}

