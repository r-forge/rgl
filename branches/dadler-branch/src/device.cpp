// C++ source
// This file is part of RGL.
//
// $Id: device.cpp,v 1.2.2.3 2004/06/11 13:31:15 dadler Exp $

#include "device.h"
#include "rglview.h"
#include "gui.h"
#include "lib.h"

// --- COMMAND CLASS ---------------------------------------------------------

Command::Command(Device* me, CommandPtr f, void* u) : Event( static_cast<IEventHandler*>(me) ), func(f) , userdata(u)
{ }

// --- DEVICE CLASS ----------------------------------------------------------

Device::Device()
{
  destroyHandler = NULL;
  window = NULL;
  scene = NULL;
}

Device::~Device()
{
  if (window) {
    window->setDestroyHandler(NULL, NULL);
    delete window;
  }

  if (scene) {
    delete scene;
  }

}

void Device::setID(int id)
{
  this->id = id;
}

int  Device::getID() 
{
  return id;
}

void Device::addDeviceListener(IDeviceListener* l)
{
  deviceListeners.push_back(l);
}

void Device::removeDeviceListener(IDeviceListener* l)
{
  deviceListeners.remove(l);
}

void Device::processEvent(Event* e)
{
  Command* ethis = reinterpret_cast<Command*>(e);
    (this->*(ethis->func) )( ethis->userdata);
}

void Device::do_open(void*)
{
  window->setVisibility(true);  
}
 
bool Device::open()
{
  start();
  postEvent( new Command(this,&Device::do_open,NULL) );
  return true;
}

void Device::do_close(void*)
{
  if (window) {
    window->setDestroyHandler(NULL,NULL);
    delete window;
    window = NULL;
  }
  fireDeviceDisposed();
}

void Device::close()
{
  postEvent( new Command(this,&Device::do_close,NULL) );
}

/**
 * thread method
 **/

void Device::run()
{
  scene   = new Scene();
  rglview = new RGLView(scene);
  window  = new Window( rglview, getGUIFactory() );
  window->setDestroyHandler(this, window);
  Task::run();
}

void Device::shutdown()
{
  delete this;
}

void Device::fireDeviceDisposed()
{
  for (list<IDeviceListener*>::iterator i = deviceListeners.begin() ; i != deviceListeners.end() ; ++ i )
    (*i)->deviceDisposed(this);
}

void Device::notifyDestroy(void* userdata)
{
  window = NULL;
  fireDeviceDisposed();
}

void Device::setDestroyHandler(DestroyHandler* inDestroyHandler, void* userdata)
{
  destroyHandler = inDestroyHandler;
  destroyHandler_userdata = userdata;
}

#include <cstring>

void Device::do_setName(void* userdata)
{
  char* string = reinterpret_cast<char*>(userdata);
  window->setTitle(string);
  free(string);
}

void Device::setName(char* string)
{
  postEvent( new Command(this,&Device::do_setName,reinterpret_cast<void*>( strdup(string) ) ) );
}

void Device::update()
{
//  window->update();
}


void Device::bringToTop(void)
{
#ifdef _WIN32
  window->bringToTop();
#endif
}

//
// scene management:
//

#include "lib.h"

void Device::do_clear(void* userdata)
{
  TypeID stackTypeID = (int) userdata;
  bool success;
  if ( success = scene->clear(stackTypeID) )
    rglview->update();

  // return success;
}

bool Device::clear(TypeID stackTypeID)
{
  postEvent( new Command(this, &Device::do_clear, reinterpret_cast<void*>(stackTypeID) ) );
  return true;
}

void Device::do_add(void* userdata)
{
  SceneNode* node = reinterpret_cast<SceneNode*>(userdata);
  bool success;
  if ( success = scene->add(node) )
    rglview->update();
  // return success;
}

bool Device::add(SceneNode* node)
{
  postEvent( new Command(this, &Device::do_add, reinterpret_cast<void*>(node) ) );  
  return true;
}

void Device::do_pop(void* userdata)
{
  TypeID stackTypeID = reinterpret_cast<TypeID>(userdata);
  bool success;
  if ( success = scene->pop(stackTypeID) )
    rglview->update();  
//  return success;
}
 
bool Device::pop(TypeID stackTypeID)
{
  postEvent( new Command(this, &Device::do_pop, reinterpret_cast<void*>(stackTypeID) ) );  
  return true;
}

//
// export
//

void Device::do_snapshot(void* userdata)
{
  PixmapFileFormatID format = PIXMAP_FILEFORMAT_PNG;
  char* filename = reinterpret_cast<char*>(userdata);

  rglview->snapshot( (PixmapFileFormatID) format, filename );
  free(filename);
}

bool Device::snapshot(int format, const char* filename)
{
  postEvent( new Command(this, &Device::do_snapshot, reinterpret_cast<void*>( strdup(filename) ) ) );  
  return true;
}
