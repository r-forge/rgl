#include "config.hpp"
#ifdef RGL_X11
// C++ source
// This file is part of RGL.
//
// $Id$

#include "lib.hpp"


//
// ===[ GUI IMPLEMENTATION ]=================================================
//

#include "x11gui.hpp"

gui::X11GUIFactory* gpX11GUIFactory = NULL;


namespace lib {

gui::GUIFactory* getGUIFactory()
{
  return (gui::GUIFactory*) gpX11GUIFactory;
}
}

//
// ===[ R INTEGRATION ]=======================================================
//

#include "R.h"
#include <R_ext/eventloop.h>

static InputHandler* R_handler = NULL;

static void R_rgl_eventHandler(void * userData)
{
  gpX11GUIFactory->processEvents();
}

static void set_R_handler()
{
  // add R input handler (R_ext/eventloop.h)
  // approach taken from GtkDevice ... good work guys!
  
  R_handler = ::addInputHandler(R_InputHandlers, gpX11GUIFactory->getFD(), R_rgl_eventHandler, XActivity);

  // seek end of node
  
  while(R_handler->next)
    R_handler = R_handler->next;
}

static void unset_R_handler()
{
  if (R_handler) {
    ::removeInputHandler(&R_InputHandlers, R_handler);
    R_handler = NULL;
  }
}

//
// ===[ LIB INIT / QUIT ]=====================================================
//
namespace lib {

bool init()
{
  bool success = false;

  // construct GUI Factory
  
  gpX11GUIFactory = new gui::X11GUIFactory(NULL);
 
  if ( gpX11GUIFactory->isConnected() ) {
    set_R_handler();
    success = true;
  }
  return success;
}

void quit()
{
  unset_R_handler();
  delete gpX11GUIFactory;
}

//
// ===[ LIB SERVICES ]=======================================================
//

//
// printMessage
//

void printMessage( const char* string ) {
  warning("RGL: %s\n", string);
}

//
// getTime
//

#include <sys/time.h>
#include <unistd.h>

double getTime() {
  struct ::timeval t;
  gettimeofday(&t,NULL);
  return ( (double) t.tv_sec ) * 1000.0 + ( ( (double) t.tv_usec ) / 1000.0 ); 
}

} // namespace lib
// ---------------------------------------------------------------------------
#endif // RGL_X11

