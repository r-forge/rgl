#include "Viewpoint.hpp"

#include "opengl.hpp"

//////////////////////////////////////////////////////////////////////////////
//
// CLASS
//   Viewpoint
//

Viewpoint::Viewpoint(PolarCoord in_position, float in_fov, float in_zoom, Vec3 in_scale, bool in_interactive) :
    SceneNode(VIEWPOINT),
    fov(in_fov),
    zoom(in_zoom),
    interactive(in_interactive)
{
    scale[0] = in_scale.x;
    scale[1] = in_scale.y;
    scale[2] = in_scale.z;
     
    setPosition(in_position);
    clearMouseMatrix();
}


PolarCoord& Viewpoint::getPosition()
{
  return position;
}

Viewpoint::Viewpoint(double* in_userMatrix, float in_fov, float in_zoom, Vec3 in_scale, bool in_interactive) :
    SceneNode(VIEWPOINT),
    position( PolarCoord(0.0f, 0.0f) ),
    fov(in_fov),
    zoom(in_zoom),
    interactive(in_interactive)
{
    for (int i=0; i<16; i++) {
	userMatrix[i] = in_userMatrix[i];
    }
    scale[0] = in_scale.x;
    scale[1] = in_scale.y;
    scale[2] = in_scale.z;
    
    clearMouseMatrix();
}

void Viewpoint::setPosition(const PolarCoord& in_position)
{
    Matrix4x4 M,N;
    M.setRotate(0, in_position.phi);
    N.setRotate(1, -in_position.theta);
    M = M * N;
    M.getData((double*)userMatrix);
    position = in_position;
}

void Viewpoint::clearMouseMatrix()
{
    Matrix4x4 M;
    M.setIdentity();
    M.getData((double*)mouseMatrix);
}

float Viewpoint::getZoom() const
{
  return zoom;
}

void Viewpoint::setZoom(const float in_zoom)
{
  zoom = in_zoom;
}

bool Viewpoint::isInteractive() const
{
  return interactive;
}

void Viewpoint::setFOV(const float in_fov)
{
  fov = clamp(in_fov, 1.0, 179.0 );
}

float Viewpoint::getFOV() const
{
  return fov;
}

void Viewpoint::setupFrustum(RenderContext* rctx, const Sphere& viewSphere)
{
  frustum.enclose(viewSphere.radius, fov, rctx->rect.width, rctx->rect.height);

  // zoom

  frustum.left *= zoom;
  frustum.right *= zoom;
  frustum.bottom *= zoom;
  frustum.top *= zoom;
}

void Viewpoint::setupOrientation(RenderContext* rctx) const
{
  glMultMatrixd(mouseMatrix);
  glMultMatrixd(userMatrix);

}

void Viewpoint::setupTransformation(RenderContext* rctx, const Sphere& viewSphere)
{     
  // projection

  glMatrixMode(GL_PROJECTION);
  glLoadIdentity();
  glFrustum(frustum.left, frustum.right, frustum.bottom, frustum.top, frustum.znear, frustum.zfar);  

  // modelview

  glMatrixMode(GL_MODELVIEW);
  glLoadIdentity();

  glTranslatef( 0.0f, 0.0f, -frustum.distance );

  setupOrientation(rctx);
  glScaled(scale[0], scale[1], scale[2]);
  glTranslatef( -viewSphere.center.x, -viewSphere.center.y, -viewSphere.center.z );
}

void Viewpoint::updateMouseMatrix(Vec3 dragStart, Vec3 dragCurrent)
{
	Vec3 axis = dragStart.cross(dragCurrent);

	float angle = dragStart.angle(dragCurrent);

	glMatrixMode(GL_MODELVIEW);
	glPushMatrix();
	glLoadIdentity();
	glRotatef((GLfloat)angle, (GLfloat)axis.x, (GLfloat)axis.y, (GLfloat)axis.z);
	glGetDoublev(GL_MODELVIEW_MATRIX,mouseMatrix);
	glPopMatrix();
}

void Viewpoint::updateMouseMatrix(PolarCoord newpos)
{
    Matrix4x4 M,N;
    M.setRotate(0, newpos.phi);
    N.setRotate(1, -newpos.theta);
    M = M * N;
    M.getData((double*)mouseMatrix);
}

void Viewpoint::mouseOneAxis(Vertex dragStart,Vertex dragCurrent,Vertex axis)
{
    float angle = math::rad2deg(dragCurrent.x-dragStart.x);
    Matrix4x4 M((double *)userMatrix);
    Vec4 v = M * Vec4(axis.x, axis.y, axis.z);
    glMatrixMode(GL_MODELVIEW);
    glPushMatrix();
    glLoadIdentity();
    glRotatef((GLfloat)angle, (GLfloat)v.x/v.w, (GLfloat)v.y/v.w, (GLfloat)v.z/v.w);
    glGetDoublev(GL_MODELVIEW_MATRIX,mouseMatrix);
    glPopMatrix();
}

void Viewpoint::mergeMouseMatrix()
{
    Matrix4x4 M((double *)userMatrix), N((double *)mouseMatrix);
    M = N * M;
    M.getData((double *)userMatrix);
    N.setIdentity();
    N.getData((double *)mouseMatrix);
}

void Viewpoint::getUserMatrix(double* dest)
{
	for(int i=0; i<16;i++)
		dest[i] = userMatrix[i];
}

void Viewpoint::setUserMatrix(double* src)
{
	for(int i=0; i<16;i++)
		userMatrix[i] = src[i];
}

void Viewpoint::getScale(double* dest)
{
    dest[0] = scale[0];
    dest[1] = scale[1];
    dest[2] = scale[2];
}

void Viewpoint::setScale(double* src)
{
    scale[0] = src[0];
    scale[1] = src[1];
    scale[2] = src[2];
}

Vertex Viewpoint::getCOP(const Sphere& viewSphere) const
{
  return viewSphere.center + ( position.vector() * frustum.distance * 2.0f );
}
