#ifndef DEVICE_MANAGER_H
#define DEVICE_MANAGER_H

// C++ header file
// This file is part of RGL
//
// $Id: devicemanager.h,v 1.1.1.1.4.2 2004/06/11 13:31:15 dadler Exp $

#include "types.h"
#include "device.h"
#include "exec.hpp"

//
// CLASS
//   DeviceManager
//
// RESPONSIBILITIES
//   o Open device
//   o Current device focus management, providing device access to API implementation
//   o Device id and name accounting (appears in the window title of the device)
//   o Notify device shutdown (by user closing the window)
//   o Shutdown all devices (destruction of device manager)
//
// COLLABORATORS
//   o Device class
//   o R API implementation
//

/**
 * Device Manager interface
 **/
 
struct IDeviceManager
{
  virtual void     update() = 0;
  virtual bool     openDevice() = 0;
  virtual IDevice* getCurrentDevice() = 0;
  virtual IDevice* getAnyDevice() = 0;
  virtual bool     setCurrent(int id) = 0;
  virtual int      getCurrent() = 0;
};

/**
 * Device manager implementation
 **/
class DeviceManager : protected EventQueue, public IEventHandler, public IDeviceListener {

public:

// lib services:

  DeviceManager();
  virtual ~DeviceManager();
  
  // --- IDeviceManager implementation -----------------------------------------
  
  virtual void     update();
  virtual bool     openDevice();
  virtual IDevice* getCurrentDevice();
  virtual IDevice* getAnyDevice();
  virtual bool     setCurrent(int id);
  virtual int      getCurrent();
  
  // --- IDeviceListener implementation ----------------------------------------
  
  virtual void     deviceDisposed(IDevice* device);

protected:
    
  IDevice*         createDevice();

  // --- IEventHandler implementation ------------------------------------------

  virtual void     processEvent(Event* event);

private:

  void disableFocusManagement();
  bool isFocusManagementEnabled();  
  
  void removeDevice(IDevice* device);

  int                        idCount;
  map<int,IDevice*>          idMap;
  list< IDevice* >           devices;
  IDevice*                   current;
};

#endif /* DEVICE_MANAGER_H */
