#ifndef SCENE_HPP
#define SCENE_HPP

// C++ header file
// This file is part of RGL
//
// $Id: scene.h,v 1.3.4.1 2004/05/29 10:43:33 dadler Exp $

#include "SceneNode.hpp"

#include "geom.hpp"

#include "String.hpp"
#include "Color.hpp"
#include "Texture.hpp"
#include "Material.hpp"
#include "Light.hpp"
#include "Shape.hpp"
#include "PrimitiveSet.hpp"
#include "TextSet.hpp"
#include "SpriteSet.hpp"
#include "SphereSet.hpp"
#include "Surface.hpp"
#include "Viewpoint.hpp"
#include "Background.hpp"
#include "BBoxDeco.hpp"

class Scene {
public:
  Scene();
  ~Scene();

  // ---[ client services ]---------------------------------------------------

  /**
   * remove all nodes of the given type.
   **/
  bool clear(TypeID stackTypeID);
  
  /**
   * add node to scene
   **/
  bool add(SceneNode* node);
  
  /**
   * remove last-added node of given type.
   **/
  bool pop(TypeID stackTypeID);

  // ---[ grouping component ]-----------------------------------------------
  
  /**
   * obtain scene's axis-aligned bounding box
   **/
  const AABox& getBoundingBox() const { return data_bbox; }

  // ---[ Renderable interface ]---------------------------------------------
  
  /**
   * TODO: implements Renderable
   **/
  void render(RenderContext* renderContext);

  // ---[ bindable component ]-----------------------------------------------
  
  /**
   * obtain bounded viewpoint
   **/
  Viewpoint* getViewpoint();

private:

  // ---[ Renderable implementation ]---------------------------------------- 

  /**
   * sub-pass: setup global lighting model
   **/
  void setupLightModel(RenderContext* renderContext);
  /**
   * compute bounding-box
   **/
  void calcDataBBox();

  // ---[ bounded slots ]----------------------------------------------------
  
  /**
   * bounded background
   **/
  Background* background;
  /**
   * bounded viewpoint
   **/
  Viewpoint* viewpoint;
  /**
   * bounded decorator
   **/
  BBoxDeco*  bboxDeco;

  // ---[ stacks ]-----------------------------------------------------------
  
  /**
   * number of lights
   **/
  int  nlights;
  
  /**
   * list of light sources
   **/
  List lights;

  /**
   * list of shapes
   **/
  List shapes;

  // ---[ grouping data ]----------------------------------------------------
  
  /**
   * bounding box of overall scene
   **/
  AABox data_bbox;
};


#endif /* SCENE_HPP */

