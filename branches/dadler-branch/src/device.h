#ifndef DEVICE_H
#define DEVICE_H

// C++ header file
// This file is part of RGL
//
// $Id: device.h,v 1.2.2.1 2004/06/10 23:10:24 dadler Exp $

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

struct IDevice 
{
  virtual ~IDevice() { }
  // virtual void destroy() = 0;
  /**
   * open device.
   **/
  virtual bool open(void) = 0; // -- if failed, instance is invalid and should be deleted
  /**
   * shutdown device. this call will block until finished.
   **/
  virtual void shutdown(void) = 0;
  virtual void setDestroyHandler(DestroyHandler* destroyHandler, void* userdata) = 0;
  virtual void setName(char* string) = 0;
  virtual void close(void) = 0; // -- when done, instance is invalid and should be deleted
  virtual bool snapshot(int format, const char* filename) = 0;
  virtual bool clear(TypeID stackTypeID) = 0;
  virtual bool add(SceneNode* node) = 0;
  virtual bool pop(TypeID stackTypeID) = 0;
  virtual void bringToTop(void) = 0;
};

#include "exec.hpp"

class Device;

typedef void (Device::* CommandPtr) (void*);

class Command : public Event
{
public:
  CommandPtr func;
  void*      userdata;
  Command(Device* me, CommandPtr f, void* userdata);
};

class Device : public Task, public DestroyHandler, public IDevice
{
public: // -- all methods are blocking until action completed

  Device();
  virtual ~Device();
  virtual void run();
  virtual void shutdown();
  // virtual void destroy(void);
  virtual void setDestroyHandler(DestroyHandler* destroyHandler, void* userdata);
  virtual void setName(char* string);
  virtual bool open(void); // -- if failed, instance is invalid and should be deleted
  virtual void close(void); // -- when done, instance is invalid and should be deleted
  virtual bool snapshot(int format, const char* filename);
  virtual bool clear(TypeID stackTypeID);
  virtual bool add(SceneNode* node);
  virtual bool pop(TypeID stackTypeID);
  virtual void notifyDestroy(void* userdata);
  virtual void bringToTop(void);
protected:
  virtual void processEvent(Event* e);
// event handlers
private:
  void update(void);

  void do_open(void*);
  void do_setName(void*);
  void do_close(void*);
  void do_snapshot(void*);
  void do_clear(void*);
  void do_add(void*);
  void do_pop(void*);

  Window* window;
  RGLView* rglview;
  Scene* scene;

// destroy handler:
  DestroyHandler* destroyHandler;
  void* destroyHandler_userdata;

  friend class Command;
};

class ProxyDevice : public IDevice
{
  IDevice* impl;
public:
  ProxyDevice(IDevice* in_impl) : impl(in_impl)
  {
    
  }
  virtual ~ProxyDevice() { delete impl; }
  virtual void shutdown() { impl->shutdown(); }
  // virtual void destroy() { impl->destroy(); }
  virtual void setDestroyHandler(DestroyHandler* destroyHandler, void* userdata)
  { impl->setDestroyHandler(destroyHandler,userdata); }
  virtual void setName(char* string)
  { impl->setName(string); }
  virtual bool open(void)
  { return impl->open(); }
  virtual void close(void)
  { impl->close(); }
  virtual bool snapshot(int format, const char* filename)
  { return impl->snapshot(format,filename); }
  virtual bool clear(TypeID stackTypeID)
  { return impl->clear(stackTypeID); }
  virtual bool add(SceneNode* node)
  { return impl->add(node); }
  virtual bool pop(TypeID stackTypeID)
  { return impl->pop(stackTypeID); }
  virtual void bringToTop(void)
  { impl->bringToTop(); }

  
};

#endif /* DEVICE_H */
