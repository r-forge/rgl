// C++ source
// This file is part of RGL.
//
// $Id: select.cpp,v 1.1.2.1 2004/06/22 13:50:12 murdoch Exp $

#include "select.h"

#include <stdio.h>

void SELECT::render(double llx, double lly, double urx, double ury)
{
  glMatrixMode(GL_MODELVIEW);
  glLoadIdentity();
  glMatrixMode(GL_PROJECTION);
  glLoadIdentity();
  glOrtho(0.0f,1.0f,0.0f,1.0f,0.0f,1.0f);

  glColor3f(0.5f,0.5f,0.5f);

  glBegin(GL_LINE_LOOP);
  	glVertex2f(llx, lly);
  	glVertex2f(llx,	ury);
  	glVertex2f(urx, ury);
  	glVertex2f(urx, lly);
  glEnd();
}
