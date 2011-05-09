#ifndef RGL_DEVICE_MANAGER_HPP
#define RGL_DEVICE_MANAGER_HPP

// C++ header file
// This file is part of RGL
//
// $Id$

#include "Device.hpp"

#include <list>

/**
 * Manager component that is used as a front-end for multiple devices access
 * using an 'id' to set the current device.
 **/
class DeviceManager : protected IDisposeListener {

public:
  DeviceManager();
  virtual ~DeviceManager();
  bool    openDevice(void);
  Device* getCurrentDevice(void);
  Device* getAnyDevice(void);
  bool    setCurrent(int id, bool silent = false);
  int     getCurrent();
protected:
  /**
   * Dispose Listener implementation
   **/
  void notifyDisposed(Disposable*);
private:
  void    nextDevice();
  void    previousDevice();
  typedef std::list<Device*> Container;
  typedef Container::iterator Iterator;

  int       newID;
  Container devices;
  Iterator  current; 
};

#endif // DEVICE_MANAGER_HPP

