#
# project modules
#

SCENE_MODS=	\
Background	\
BBoxDeco	\
Color		\
FaceSet		\
Light		\
LineSet		\
Material	\
PointSet	\
PrimitiveSet	\
QuadSet		\
Shape		\
SphereMesh	\
SphereSet	\
SpriteSet	\
String		\
Surface		\
TextSet		\
Texture		\
TriangleSet	\
Viewpoint

MODS=		\
$(SCENE_MODS)	\
api 		\
device 		\
devicemanager	\
exec		\
fps 		\
geom		\
glgui		\
gui		\
math 		\
pixmap 		\
render		\
rglview		\
scene		\
types		\
win32gui	\
win32lib	\
x3d

dump-mods:
	@echo -n $(MODS)
