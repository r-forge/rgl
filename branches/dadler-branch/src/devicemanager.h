#ifndef DEVICE_MANAGER_H
#define DEVICE_MANAGER_H

// C++ header file
// This file is part of RGL
//
// $Id: devicemanager.h,v 1.1.1.1.4.1 2004/06/10 23:10:24 dadler Exp $

#include "types.h"
#include "device.h"

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

class DeviceManager : public DestroyHandler {

public:

// lib services:

  DeviceManager();
  virtual ~DeviceManager();

// device services:

  bool     openDevice(void);
  IDevice* getCurrentDevice(void);
  IDevice* getAnyDevice(void);
  bool     setCurrent(int id);
  int      getCurrent();

// device destroy handler:

  void    notifyDestroy(void* userdata);

protected:

  IDevice* createDevice();

private:

  class DeviceInfo : public Node
  {
  public:
    DeviceInfo(IDevice* device, int id);
    ~DeviceInfo();
    IDevice* device;
    int id;
  };

  DeviceInfo* current;
  List        deviceInfos;
  int         idCount;

};

#endif /* DEVICE_MANAGER_H */
