#ifndef RGL_PRIMITIVE_SET_HPP
#define RGL_PRIMITIVE_SET_HPP

#include "Shape.hpp"
#include "render.h"

class PrimitiveSet : public Shape {

  protected:
    PrimitiveSet(Material& in_material, int in_nvertices, double* vertex, int in_type, int in_nverticesperelement, bool in_ignoreExtent, bool in_bboxChange = false);
    PrimitiveSet(Material& in_material, int in_type,      int in_verticesperelement, bool in_ignoreExtent, bool in_bboxChange );
    
  public:
  // Shape Query:
    virtual void   getShapeName(char* buffer, int buflen) { strncpy(buffer, "primitive", buflen); } // overloaded
    virtual int    getElementCount(void) { return nprimitives; } // overloaded
    virtual Vertex getElementCenter(int item) { return getCenter(item); } // overloaded
            Vertex getCenter(int index); // get primitive center point
  // Setup Vertex Data:
    void initPrimitiveSet(int nv, double* pv); // setup all vertices
    void initPrimitiveSet(int nv, double* pv, int type, int nverticesperelement, bool ignoreExtent, bool bboxChange);
    void setVertex(int index, double* v) { vertexArray.setVertex(index, v); }
  
  // Draw interface:
    virtual void draw(RenderContext* renderContext); // overloaded
    
    virtual void drawAll(RenderContext* renderContext);   // draw all primitives
    virtual void drawBegin(RenderContext* renderContext); // begin draw individual primitives
    virtual void drawElement(RenderContext* renderContext, int index); // draw element
    virtual void drawEnd(RenderContext* renderContext); // /end draw individual primitives
    

  protected:
    int type;
    int nverticesperelement;
    int nvertices;
    int nprimitives;
    VertexArray vertexArray;
    bool        hasmissing; 	/* whether any vertices contain missing values */
};

// #include "FaceSet.hpp"
// #include "PointSet.hpp"
// #include "LineSet.hpp"
// #include "TriangleSet.hpp"
// #include "QuadSet.hpp"
// #include "LineStripSet.hpp"

#endif // RGL_PRIMITIVE_SET_HPP
