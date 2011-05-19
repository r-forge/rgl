#include "R.h"
#include "Rversion.h"
#include "api.h"
#include <Rdefines.h>
#include <Rinternals.h>
#include "DeviceManager.hpp"
#include "Layer.hpp"
extern "C" {
EXPORT_SYMBOL SEXP rgl_layer(SEXP args);
}

extern DeviceManager* deviceManager;

SEXP rgl_layer(SEXP fun) {
  Device* device;
  if (deviceManager && (device = deviceManager->getAnyDevice())) {
    device->add( new Layer( (void (*)() ) R_ExternalPtrAddr(fun) ) );
  }
  return R_NilValue; 
}

