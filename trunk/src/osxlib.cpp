#include "config.hpp"
// ---------------------------------------------------------------------------
#ifdef RGL_CARBON
// ---------------------------------------------------------------------------
#include "lib.hpp"
// ---------------------------------------------------------------------------
#include "osxgui.hpp"
// ---------------------------------------------------------------------------
#include "R.h"
#include "assert.hpp"
// ---------------------------------------------------------------------------
namespace lib {
// ---------------------------------------------------------------------------
void printMessage(const char* message)
{
  REprintf("RGL: %s\n", message);
}
// ---------------------------------------------------------------------------
double getTime()
{
  return 0.0;
}
// ---------------------------------------------------------------------------
gui::OSXGUIFactory* gGUIFactory = 0;
// ---------------------------------------------------------------------------
gui::GUIFactory* getGUIFactory()
{ 
  return gGUIFactory;
}
// ---------------------------------------------------------------------------
bool init()
{
  assert(gGUIFactory == 0);
  gGUIFactory = new gui::OSXGUIFactory();
  if (!gGUIFactory->hasEventLoop()) {
	Rprintf("RGL: configured for Carbon/Cocoa, must run in R.app\n");
	return false;
  } else return true;
}
// ---------------------------------------------------------------------------
void quit()
{
  assert(gGUIFactory);
  delete gGUIFactory;
  gGUIFactory = 0;
}
// ---------------------------------------------------------------------------
} // namespace lib
// ---------------------------------------------------------------------------
#endif // RGL_CARBON
// ---------------------------------------------------------------------------


