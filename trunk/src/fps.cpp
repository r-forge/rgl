// C++ source
// This file is part of RGL.
//
// $Id: fps.cpp,v 1.2 2004/08/27 15:58:57 dadler Exp $

#include "fps.h"

#include "glgui.h"

#include <stdio.h>

void FPS::init(double time)
{
  lastTime = time;
  framecnt = 0;
  buffer[0] = '0';
  buffer[1] = '\0';
}

void FPS::render(double t, RenderContext* ctx)
{
  if (lastTime + 1.0f < t ) {
    lastTime = t;
    sprintf(buffer, "FPS %d", framecnt);
    framecnt = 0;
  }

  glMatrixMode(GL_MODELVIEW);
  glLoadIdentity();
  glMatrixMode(GL_PROJECTION);
  glLoadIdentity();
  glOrtho(-1.0f,1.0f,-1.0f,1.0f,-1.0f,1.0f);

  glColor3f(1.0f,1.0f,1.0f);
  glRasterPos2f( 1.0f, -0.9f);

  ctx->font->enable();
  ctx->font->draw(buffer, strlen(buffer), -1);
  framecnt++;
}
