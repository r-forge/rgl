#ifndef WIN32_GUI_H
#define WIN32_GUI_H

// C++ header file
// This file is part of RGL
//
// $Id: win32gui.h,v 1.3.2.1 2004/06/10 23:10:24 dadler Exp $


#include "gui.h"

#include <windows.h>

namespace gui {

  class Win32GUIFactory : public GUIFactory
  {
  
  public:
  
    Win32GUIFactory(HINSTANCE inModuleHandle);
    virtual ~Win32GUIFactory();
  
    WindowImpl* createWindowImpl(Window* window);
      
  };

  class Win32GUIToolKit
  {
  public:
    static void pollAndDispatch();
  };

} // namespace gui


#endif /* WIN32_GUI_H */

