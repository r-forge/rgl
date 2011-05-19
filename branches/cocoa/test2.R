library(rgl)
quartz()
dev.off()
example(rgl.surface)
library(rdyncall)
dynport(GL)
mylayer <- function() {
  glClearColor(0,0,1,0)
  glClear(GL_COLOR_BUFFER_BIT)
  glMatrixMode(GL_PROJECTION)
  glPushMatrix()
  glLoadIdentity()
  glOrtho(-1,1,-1,1,-1,1)
  glMatrixMode(GL_MODELVIEW)
  glPushMatrix()
  glLoadIdentity()
  nvertices <- 500
  ncomponents <- 3
  points <- rnorm(nvertices*ncomponents,0,2)
  glEnableClientState(GL_VERTEX_ARRAY)
  glVertexPointer(ncomponents, GL_DOUBLE, 0, points)
  glDrawArrays(GL_POINTS,0,nvertices)
  glDisableClientState(GL_VERTEX_ARRAY)
  glMatrixMode(GL_PROJECTION)
  glPopMatrix()
  glMatrixMode(GL_MODELVIEW)
  glPopMatrix()
}
cb <- new.callback(")v", mylayer)
rgl.layer(cb)


