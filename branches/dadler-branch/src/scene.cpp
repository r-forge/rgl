// C++ source
// This file is part of RGL.
//
// $Id: scene.cpp,v 1.7.2.1 2004/05/29 10:43:33 dadler Exp $

#include "scene.h"
#include "math.h"
#include "render.h"
#include "geom.hpp"
/*
#include "String.cpp"
#include "Color.cpp"
#include "Texture.cpp"
#include "Material.cpp"
#include "Light.cpp"
#include "Shape.cpp"
#include "PrimitiveSet.cpp"
#include "PointSet.cpp"
#include "LineSet.cpp"
#include "FaceSet.cpp"
#include "TriangleSet.cpp"
#include "QuadSet.cpp"
#include "TextSet.cpp"
#include "SpriteSet.cpp"
#include "SphereSet.cpp"
#include "Surface.cpp"
#include "Viewpoint.cpp"
#include "Background.cpp"
#include "BBoxDeco.cpp"
 */

//////////////////////////////////////////////////////////////////////////////
//
// CLASS
//   Scene
//

static int gl_light_ids[8] = { GL_LIGHT0, GL_LIGHT1, GL_LIGHT2, GL_LIGHT3, GL_LIGHT4, GL_LIGHT5, GL_LIGHT6, GL_LIGHT7 };

Scene::Scene()
{
  background = NULL;
  viewpoint  = NULL;
  nlights    = 0;
  bboxDeco   = NULL;
 
  add( new Background );
  add( new Viewpoint );
  add( new Light ); 
}

Scene::~Scene()
{
  clear(SHAPE);
  clear(LIGHT);
  clear(BBOXDECO);

  if (background)
    delete background;
  if (viewpoint)
    delete viewpoint;
}

Viewpoint* Scene::getViewpoint() 
{
  return viewpoint;
}

bool Scene::clear(TypeID typeID)
{
  bool success = false;

  switch(typeID) {
    case SHAPE:
      shapes.deleteItems();
      data_bbox.invalidate();
      success = true;
      break;
    case LIGHT:
      lights.deleteItems();
      nlights = 0;
      success = true;
      break;
    case BBOXDECO:
      delete bboxDeco;
      bboxDeco = NULL;
      success = true;
      break;
    default:
      break;
  }
  return success;
}

bool Scene::add(SceneNode* node)
{
  bool success = false;
  switch( node->getTypeID() )
  {
    case LIGHT:
      if (nlights < 8) {

        Light* light = (Light*) node;

        light->id = gl_light_ids[ nlights++ ];

        lights.addTail( light );

        success = true;
      }
      break;
    case SHAPE:
      {
        Shape* shape = (Shape*) node;

        data_bbox += shape->getBoundingBox();

        shapes.addTail( shape );
        success = true;
      }
      break;
    case VIEWPOINT:
      {
        if (viewpoint)
          delete viewpoint;
        viewpoint = (Viewpoint*) node;
        success = true;
      }
      break;
    case BACKGROUND:
      {
        if (background)
          delete background;
        background = (Background*) node;
        success = true;
      }
      break;
    case BBOXDECO:
      {
        if (bboxDeco)
          delete bboxDeco;
        bboxDeco = (BBoxDeco*) node;
        success = true;
      }
      break;
    default:
      break;
  }
  return success;
}


bool Scene::pop(TypeID type)
{
  bool success = false;

  switch(type) {
  case SHAPE:
    {
      Node* tail = shapes.getTail();
      if (tail) {
        delete shapes.remove(tail);

        calcDataBBox();

        success = true;
      }
    }
    break;
  case LIGHT:
    {
      Node* tail = lights.getTail();
      if (tail) {
        delete lights.remove(tail);
        nlights--;
        success = true;
      }
    }
    break;
  case BBOXDECO:
    {
      if (bboxDeco) {
        delete bboxDeco;
        bboxDeco = NULL;
        success = true;
      }
    }
    break;
  default: // VIEWPOINT,BACKGROUND ignored
    break;
  }

  return success;
}

void Scene::render(RenderContext* renderContext)
{
  renderContext->scene     = this;
  renderContext->viewpoint = viewpoint;


  //
  // CLEAR BUFFERS
  //

  GLbitfield clearFlags = 0;

  // Depth Buffer

  glClearDepth(1.0);
  glDepthFunc(GL_LESS);

  clearFlags  |= GL_DEPTH_BUFFER_BIT;

  // Color Buffer (optional - depends on background node)
  
  clearFlags |= background->setupClear(renderContext);

  // clear

  glClear(clearFlags);


  //
  // SETUP LIGHTING MODEL
  //

  setupLightModel(renderContext);


  Sphere total_bsphere;

  if (data_bbox.isValid()) {
    
    // 
    // GET DATA VOLUME SPHERE
    //

    total_bsphere = Sphere( (bboxDeco) ? bboxDeco->getBoundingBox(data_bbox) : data_bbox );

  } else {
    total_bsphere = Sphere( Vertex(0,0,0), 1 );
  }


  //
  // SETUP VIEWPORT TRANSFORMATION
  //

  glViewport(0,0,renderContext->size.width, renderContext->size.height);


  //
  //
  //

  viewpoint->setupFrustum( renderContext, total_bsphere );

  //
  // RENDER BACKGROUND
  //

  background->render(renderContext);

  
  //
  // RENDER MODEL
  //

  if (data_bbox.isValid() ) {

    //
    // SETUP CAMERA
    //

    viewpoint->setupTransformation( renderContext, total_bsphere);

    //
    // RENDER BBOX DECO
    //

    if (bboxDeco)
      bboxDeco->render(renderContext);

    //
    // RENDER SOLID SHAPES
    //

    glEnable(GL_DEPTH_TEST);

    ListIterator iter(&shapes);

    for(iter.first(); !iter.isDone(); iter.next() ) {
      Shape* shape = (Shape*) iter.getCurrent();

      if (!shape->getMaterial().alphablend)
        shape->render(renderContext);
    }
    
    //
    // RENDER ALPHA SHADED
    //

    for(iter.first(); !iter.isDone(); iter.next() ) {
      Shape* shape = (Shape*) iter.getCurrent();

      if (shape->getMaterial().alphablend)
        shape->render(renderContext);
    }

  }
}


void Scene::setupLightModel(RenderContext* rctx)
{
  Color global_ambient(0.0f,0.0f,0.0f,1.0f);

  glLightModelfv(GL_LIGHT_MODEL_AMBIENT, global_ambient.data );
  glLightModeli(GL_LIGHT_MODEL_LOCAL_VIEWER, GL_TRUE );
  glLightModeli(GL_LIGHT_MODEL_TWO_SIDE, GL_TRUE );

#ifdef GL_VERSION_1_2
//  glLightModeli(GL_LIGHT_MODEL_COLOR_CONTROL, GL_SINGLE_COLOR );
#endif

  //
  // global lights
  //

  glMatrixMode(GL_MODELVIEW);
  glLoadIdentity();

  rctx->viewpoint->setupOrientation(rctx);

  ListIterator iter(&lights);

  for(iter.first(); !iter.isDone() ; iter.next() ) {

    Light* light = (Light*) iter.getCurrent();

    if (!light->viewpoint)
      light->setup(rctx);
  }

  //
  // viewpoint lights
  //

  glMatrixMode(GL_MODELVIEW);
  glLoadIdentity();

  for(iter.first(); !iter.isDone() ; iter.next() ) {

    Light* light = (Light*) iter.getCurrent();

    if (light->viewpoint)
      light->setup(rctx);

  }

  //
  // disable unused lights
  //

  for (int i=nlights;i<8;i++)
    glDisable(gl_light_ids[i]);

}

void Scene::calcDataBBox()
{
  data_bbox.invalidate();

  ListIterator iter(&shapes);

  for(iter.first(); !iter.isDone(); iter.next() ) {
    Shape* shape = (Shape*) iter.getCurrent();

    data_bbox += shape->getBoundingBox();
  }
}



