#ifndef SHAPE_HPP
#define SHAPE_HPP

#include "SceneNode.hpp"
#include "Material.hpp"
#include "RenderContext.hpp"

#include "opengl.hpp"
#include "geom.hpp"

#define VERTICES 1
#define NORMALS 2
#define COLORS 3
#define TEXCOORDS 4
#define SURFACEDIM 5

typedef unsigned int AttribID;

//
// CLASS
//   Shape
//

class Shape : public SceneNode
{
public:
  Shape(Material& in_material,bool in_ignoreExtent, TypeID in_typeID=SHAPE, bool in_bboxChanges=false);
  ~Shape();
  
  /**
   * render shape.
   * Default Implementation: uses z-buffer and a display list 
   * that stores everything from a call to draw().  
   **/
  virtual void render(RenderContext* renderContext);

  /**
   * request update of node due to content change. 
   * This will result in a new 'recording' of the display list.
   **/
  virtual void update(RenderContext* renderContext);

  /**
   * draw. 
   **/
  virtual void draw(RenderContext* renderContext);

  /**
   * obtain bounding box
   **/
  const AABox& getBoundingBox() const { return boundingBox; }
  
  /**
   * does this shape change dimensions according to the way it is rendered?
   * if so, the above is just a guess...
   **/
  const bool getBBoxChanges() const { return bboxChanges; }

  /**
   * this shows how the shape would be sized in the given context
   **/
  virtual AABox& getBoundingBox(RenderContext* renderContext) { return boundingBox; }
  
  /**
   * obtain material
   **/
  const Material& getMaterial() const { return material; }
  
  const bool getIgnoreExtent() const { return ignoreExtent; }

  virtual void getShapeName(char* buffer, int buflen) { strncpy(buffer, "shape", buflen); };
  
  /**
   * invalidate display list
   **/
  void invalidateDisplaylist();
  
  /**
   * access to individual items
   **/
   
  virtual int getElementCount(void) = 0; 
  virtual int getAttributeCount(AttribID attrib);
  virtual void getAttribute(AttribID attrib, int first, int count, double* result);
  
  /**
   * location of individual items
   **/
  
  virtual Vertex getElementCenter(int index) { return boundingBox.getCenter(); }

  /**
   * Starting to render the shape.  After this, the renderContext won't change until
   * the next call.  This will only be called once per rendering.
   **/
  virtual void renderBegin(RenderContext* renderContext) { };

  /**
   * begin sending items.  This may be called multiple times, e.g. if the
   * items are being intermixed with items from other shapes
   **/
  virtual void drawBegin(RenderContext* renderContext);

  /**
   * send one item
   **/
  virtual void drawElement(RenderContext* renderContext, int index) = 0;

  /**
   * end sending items
   **/
  virtual void drawEnd(RenderContext* renderContext);

  const bool isTransparent() const { return transparent; }
  
  const bool isBlended() const { return blended; }
  
protected:
  /**
   * bounding volume of overall geometry
   **/
  AABox    boundingBox;
  
  /**
   * bounding volume changes depending on the scene?
   **/
  bool     bboxChanges;
  
  /*
   * whether this object should be ignored in scene bounding box calculations
   */ 
  bool     ignoreExtent; 
  
  /**
   * material
   **/
  Material material;
private:
  /**
   * display list
   **/
  GLuint   displayList;
  int	   drawLevel;     /* for debugging */
protected:
  /**
   * update indicator
   **/
  bool     doUpdate;
  bool     transparent, blended;
};

class ShapeItem {
public:
  ShapeItem(Shape* in_shape, int in_itemnum) : shape(in_shape), itemnum(in_itemnum) {};
  Shape* shape;
  int itemnum;
};

#endif // SHAPE_HPP
