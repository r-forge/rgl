// C++ source
// This file is part of RGL.
//
// $Id: devicemanager.cpp,v 1.1.1.1.4.2 2004/06/11 13:31:15 dadler Exp $

#include "devicemanager.h"
#include "types.h"
#include <stdio.h>
#include <algorithm>

// --- DEVICE DISPOSED EVENT -------------------------------------------------

enum {
  DEVICE_DISPOSED = 0
};

struct DeviceEvent : public Event
{
  int      type;
  IDevice* device;
  DeviceEvent(IEventHandler* h, IDevice* d, int in_type)
  : Event(h), type(in_type), device(d)
  { }
};

// ---- DEVICE MANAGER IMPLEMENTATION ----------------------------------------

DeviceManager::DeviceManager()
: idCount(1), idMap(), devices(), current( NULL )
{ }

DeviceManager::~DeviceManager()
{
  disableFocusManagement();
  
  // broadcast close
  
  for (list<IDevice*>::iterator i = devices.begin() ; i != devices.end() ; ++ i )
    (*i)->close();

  // wait till disposed
  
  while( devices.size() > 0 ) {
    update();
    Thread::sleep(1000);
  }
  
}

/**
 * update device manager state
 **/

void DeviceManager::update()
{
  dispatchEvents();
}

/**
 * DISABLE FOCUS MANAGEMENT
 *
 * disables focus management by setting the current focus to null.
 * it helps while the destructor closes devices and does not
 * have to fix up the current focus. 
 **/

void DeviceManager::disableFocusManagement()
{
  current = NULL;
}

bool DeviceManager::isFocusManagementEnabled()
{
  return ( current != NULL ) ? true : false;
}

/**
 * Event processing
 **/

void DeviceManager::processEvent(Event* e)
{
  DeviceEvent* deviceEvent = reinterpret_cast<DeviceEvent*>(e); 
  switch(deviceEvent->type) {
    case DEVICE_DISPOSED:
      removeDevice(deviceEvent->device);
      break;
  }
}

/**
 * Device Listener
 **/

void DeviceManager::deviceDisposed(IDevice* device)
{
  postEvent( new DeviceEvent(this,device,DEVICE_DISPOSED) );
}

/**
 * remove device from list possibly updating current focus.
 **/

void DeviceManager::removeDevice(IDevice* device)
{
  list<IDevice*>::iterator i = find(devices.begin(), devices.end(), device);
  
  if ( i != devices.end() ) {
    int id = device->getID();
    idMap.erase( idMap.find(id) );
    if ( isFocusManagementEnabled() ) {
      // FIX FOCUS MANAGEMENT
      if ( *i == current ) {
        list<IDevice*>::iterator next = i; 
        ++next;
        if ( next == devices.end() )
          next = devices.begin(); 
        if ( *next != current ) {
          current = NULL;
          setCurrent( (*next)->getID() );
        } else
          current = NULL;
      }
    }
    
    devices.remove(device);
    
    delete device;
  }
}

//
// METHOD openDevice
//

bool DeviceManager::openDevice(void)
{
  bool success = false;  
  IDevice* device = createDevice(); 
  if (device) {
    device->addDeviceListener(this);
    if ( device->open() ) {
      int id = idCount++; 
      device->setID(id);
      idMap.insert( pair<int,IDevice*>(id,device) ); 
      devices.push_back(device);
      setCurrent(id);
      success = true;
    }       
  }
  return success;
}


//
// METHOD getCurrent
//

IDevice* DeviceManager::getCurrentDevice(void)
{
  return current;
}

//
// METHOD getAnyDevice
//

IDevice* DeviceManager::getAnyDevice(void)
{
  if ( current == NULL )
    openDevice();

  return getCurrentDevice();

}


//
// METHOD getCurrent
//

int DeviceManager::getCurrent()
{
  return (current != NULL ) ? current->getID() : 0;
}


//
// METHOD setCurrent
//

bool DeviceManager::setCurrent(int id)
{
  map<int,IDevice*>::iterator i = idMap.find(id);
  char buffer[64];

  if ( i != idMap.end() ) {    
    if ( current != NULL ) {
      sprintf(buffer, "RGL device %d", current->getID() );
      current->setName(buffer);
    }

    current = i->second;

    sprintf(buffer, "RGL device %d [R Focus]", current->getID() );
    current->setName(buffer);

    return true;
  }

  return false;
}

// 
// Device Factory Method
//

IDevice* DeviceManager::createDevice() 
{
  return new Device();
}


