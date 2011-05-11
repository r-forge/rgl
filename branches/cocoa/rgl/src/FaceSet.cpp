#include "FaceSet.hpp"

FaceSet::FaceSet(

  Material& in_material, 
  int in_nelements, 
  double* in_vertex, 
  double* in_normals,
  double* in_texcoords,
  int in_type, 
  int in_nverticesperelement,
  bool in_ignoreExtent,
  int in_useNormals,
  int in_useTexcoords,
  bool in_bboxChange

)
: PrimitiveSet(in_material, in_nelements, in_vertex, in_type, in_nverticesperelement, in_ignoreExtent, in_bboxChange)
{
  if (material.lit) {
    normalArray.alloc(nvertices);
    if (in_useNormals) {
      for(int i=0;i<nvertices;i++) {
        normalArray[i].x = (float) in_normals[i*3+0];
        normalArray[i].y = (float) in_normals[i*3+1];
        normalArray[i].z = (float) in_normals[i*3+2];
      }
    } else {
      for (int i=0;i<=nvertices-nverticesperelement;i+=nverticesperelement) 
      {   
        if (hasmissing && (vertexArray[i].missing() ||
                           vertexArray[i+1].missing() ||
                           vertexArray[i+2].missing()) )
          normalArray[i] = Vertex(0.0, 0.0, 0.0);
        else
          normalArray[i] = vertexArray.computeNormal(i,i+1,i+2);
        for (int j=1;j<nverticesperelement;++j)    
          normalArray[i+j] = normalArray[i];
      }
    }
  }
  if (in_useTexcoords) {
    texCoordArray.alloc(nvertices);
    for(int i=0;i<nvertices;i++) {
      texCoordArray[i].s = (float) in_texcoords[i*2+0];
      texCoordArray[i].t = (float) in_texcoords[i*2+1];      
    }
  }
}

FaceSet::FaceSet(Material& in_material, 
    int in_type,
    int in_nverticesperelement,
    bool in_ignoreExtent,
    bool in_bboxChange
    ) :
  PrimitiveSet(in_material, in_type, in_nverticesperelement, in_ignoreExtent,in_bboxChange)
{ 
}

void FaceSet::initFaceSet(
  int in_nelements, 
  double* in_vertex, 
  double* in_normals,
  double* in_texcoords
) {
  initPrimitiveSet(in_nelements, in_vertex);
  
  bool useNormals = (in_normals) ? true : false;
  bool useTexcoords = (in_texcoords) ? true : false;

  if (material.lit) {
    normalArray.alloc(nvertices);
    if (useNormals) {
      for(int i=0;i<nvertices;i++) {
        normalArray[i].x = (float) in_normals[i*3+0];
        normalArray[i].y = (float) in_normals[i*3+1];
        normalArray[i].z = (float) in_normals[i*3+2];
      }
    } else {
      for (int i=0;i<=nvertices-nverticesperelement;i+=nverticesperelement) 
      {   
        if (hasmissing && (vertexArray[i].missing() ||
                           vertexArray[i+1].missing() ||
                           vertexArray[i+2].missing()) )
          normalArray[i] = Vertex(0.0, 0.0, 0.0);
        else
          normalArray[i] = vertexArray.computeNormal(i,i+1,i+2);
        for (int j=1;j<nverticesperelement;++j)    
          normalArray[i+j] = normalArray[i];
      }
    }
  }
  if (useTexcoords) {
    texCoordArray.alloc(nvertices);
    for(int i=0;i<nvertices;i++) {
      texCoordArray[i].s = (float) in_texcoords[i*2+0];
      texCoordArray[i].t = (float) in_texcoords[i*2+1];      
    }
  }
}

// ---------------------------------------------------------------------------

void FaceSet::drawBegin(RenderContext* renderContext)
{  
  PrimitiveSet::drawBegin(renderContext);

  if (material.lit)
    normalArray.beginUse();
    
  texCoordArray.beginUse();
}

// ---------------------------------------------------------------------------

void FaceSet::drawEnd(RenderContext* renderContext)
{  
  texCoordArray.endUse();
  
  if (material.lit)
    normalArray.endUse();

  PrimitiveSet::drawEnd(renderContext);
}

