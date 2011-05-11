#include "GLFont.hpp"
#include "gl2ps.h"

GLboolean GLFont::justify(double width, double height, double adjx, double adjy, const RenderContext& rc) {
  GLdouble pos[4], pos2[4];
  double basex = 0.0, basey = 0.0, scaling = 1.0;
  GLboolean valid;
  gl2ps_centering = GL2PS_TEXT_BL;
  
  if (adjx > 0) {

    if (rc.gl2psActive > GL2PS_NONE) scaling = GL2PS_SCALING;
     
    if ( adjx > 0.25 && rc.gl2psActive == GL2PS_POSITIONAL) {
      if (adjx < 0.75) {
        basex = 0.5;
        gl2ps_centering = GL2PS_TEXT_B;
      } else {
        basex = 1.0;
        gl2ps_centering = GL2PS_TEXT_BR;
      }
    }
  }  

  if ((adjx != basex) || (adjy != basey)) {
    glGetDoublev(GL_CURRENT_RASTER_POSITION, pos);    
    pos[0] = pos[0] - scaling*width*(adjx-basex); 
    pos[1] = pos[1] - scaling*height*(adjy-basey);
    gluUnProject( pos[0], pos[1], pos[2], rc.modelview, rc.projection, rc.viewport, pos2, pos2 + 1, pos2 + 2);
    glRasterPos3dv(pos2);
  }
  
  glGetBooleanv(GL_CURRENT_RASTER_POSITION_VALID, &valid);
  return valid;
}


