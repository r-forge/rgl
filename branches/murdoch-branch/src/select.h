#ifndef PLX_SELECT_H
#define PLX_SELECT_H

// C++ header file
// This file is part of RGL
//
// $Id: select.h,v 1.1.2.1 2004/06/22 13:50:12 murdoch Exp $

#include "scene.h"

//
// Mouse selection rectangle
//

class SELECT
{
public:
  inline SELECT() { };
  void render(double llx, double lly, double urx, double ury);
};

#endif // PLX_SELECT_H

