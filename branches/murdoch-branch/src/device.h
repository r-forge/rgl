#ifndef DEVICE_H
#define DEVICE_H

// C++ header file
// This file is part of RGL
//
// $Id: device.h,v 1.1.1.1.2.4 2004/06/22 12:40:14 murdoch Exp $

#include "types.h"
#include "rglview.h"


//
// class Device
//
// - display device title
// - setup the view matrix container (rows and columns of views)
// - setup the view/scene relation (scene per view -or- shared scene)
// - manages current view
// - dispatches scene services to current view's scene
//


class Device : public DestroyHandler
{
public: // -- all methods are blocking until action completed

  Device();
  virtual ~Device();
  void destroy(void);
  void setDestroyHandler(DestroyHandler* destroyHandler, void* userdata);
  void setName(const char* string);
  bool open(void); // -- if failed, instance is invalid and should be deleted
  void close(void); // -- when done, instance is invalid and should be deleted
  bool snapshot(int format, const char* filename);

  bool clear(TypeID stackTypeID);
  bool add(SceneNode* node);
  bool pop(TypeID stackTypeID);

  //Added by Ming Chen
  //void bringToTop(void);

  void notifyDestroy(void* userdata);

#ifdef _WIN32
  void bringToTop(void);
#endif

  RGLView* getRGLView(void);
// event handlers
private:
  void update(void);

  Window* window;
  RGLView* rglview;
  Scene* scene;

// destroy handler:
  DestroyHandler* destroyHandler;
  void* destroyHandler_userdata;
};

#endif /* DEVICE_H */
