#
# R3D rendering functions - rgl implementation
# $Id$
# 

# Node Management

clear3d     <- function(type = "shapes") {
    .check3d()
    rgl.clear( type )
    if ( 4 %in% rgl.enum.nodetype(type) ) { # viewpoint
	do.call("par3d", get("r3dDefaults", envir=.GlobalEnv)[c("FOV", "userMatrix")])
    }
}

pop3d       <- function(...) {.check3d(); rgl.pop(...)}

# Environment

bg3d        <- function(color, ...) {
  .check3d(); save <- rgl.getmaterial(); on.exit(rgl.material(save))
  rgl.bg(color=color, ...)
}

material3d  <- rgl.material

light3d     <- function(theta=0,phi=15,...) {
    .check3d(); save <- rgl.getmaterial(); on.exit(rgl.material(save))
    rgl.light(theta=theta,phi=phi,...)
}

view3d      <- function(theta=0,phi=15,...) {
  .check3d()
  rgl.viewpoint(theta=theta,phi=phi,...)
}

bbox3d	    <- function(...) {  
  .check3d(); save <- rgl.getmaterial(); on.exit(rgl.material(save))
  rgl.bbox(...)
}

# Shapes

points3d    <- function(x,y=NULL,z=NULL,...) {
  .check3d(); save <- rgl.getmaterial(); on.exit(rgl.material(save)) 
  rgl.points(x=x,y=y,z=z,...)
}

lines3d     <- function(x,y=NULL,z=NULL,...) {
  .check3d(); save <- rgl.getmaterial(); on.exit(rgl.material(save))
  rgl.linestrips(x=x,y=y,z=z,...)
}

segments3d  <- function(x,y=NULL,z=NULL,...) {
  .check3d(); save <- rgl.getmaterial(); on.exit(rgl.material(save))
  rgl.lines(x=x,y=y,z=z,...)
}

triangles3d <- function(x,y=NULL,z=NULL,...) {
  .check3d(); save <- rgl.getmaterial(); on.exit(rgl.material(save))
  rgl.triangles(x=x,y=y,z=z,...)
}

quads3d     <- function(x,y=NULL,z=NULL,...) {
  .check3d(); save <- rgl.getmaterial(); on.exit(rgl.material(save))
  rgl.quads(x=x,y=y,z=z,...)
}

text3d      <- function(x,y=NULL,z=NULL,texts,adj=0.5,justify,...) {
  .check3d(); save <- rgl.getmaterial(); on.exit(rgl.material(save))
  rgl.texts(x=x,y=y,z=z,text=texts,adj,justify,...)
}
texts3d	    <- text3d

spheres3d   <- function(x,y=NULL,z=NULL,radius=1,...) {
  .check3d(); save <- rgl.getmaterial(); on.exit(rgl.material(save))
  rgl.spheres(x=x,y=y,z=z,radius=radius,...)
}

sprites3d   <- function(x,y=NULL,z=NULL,radius=1,...) {
  .check3d(); save <- rgl.getmaterial(); on.exit(rgl.material(save))
  rgl.sprites(x=x,y=y,z=z,radius=radius,...)
}

terrain3d   <- function(x,y=NULL,z=NULL,...) {
  .check3d(); save <- rgl.getmaterial(); on.exit(rgl.material(save))
  rgl.surface(x=x,y=z,z=y,coords=c(1,3,2),...)
}
surface3d   <- terrain3d

# Interaction

select3d    <- function() {.check3d(); rgl.select3d()}

# 3D Generic Object Rendering Attributes

dot3d <- function(x,...) UseMethod("dot3d")
wire3d  <- function(x,...) UseMethod("wire3d")
shade3d <- function(x,...) UseMethod("shade3d")

# 3D Generic transformation


translate3d <- function(obj,x,y,z,...) UseMethod("translate3d")
scale3d <- function(obj,x,y,z,...) UseMethod("scale3d")
rotate3d <- function(obj,angle,x,y,z,matrix,...) UseMethod("rotate3d")
transform3d <- function(obj,matrix,...) rotate3d(obj, matrix=matrix, ...)

subdivision3d <- function(x,...) UseMethod("subdivision3d")

# 3D Custom shapes

particles3d <- function(x,y=NULL,z=NULL,radius=1,...) sprites3d(
  x=x,y=y,z=z,radius=radius,
  lit=FALSE,alpha=0.2,
  textype="alpha",
  texture=system.file("textures/particle.png",package="rgl"),
  ...
)   

# r3d default settings for new windows

r3dDefaults <- list(userMatrix = rotationMatrix(5, 1, 0, 0),
		  mouseMode = c("trackball", "zoom", "fov"),
		  FOV = 30,
		  bg = list(color="white"),
		  material = list(color="black", fog=FALSE))

open3d <- function(..., params = get("r3dDefaults", envir=.GlobalEnv))
{
    rgl.open()
    params[names(list(...))] <- list(...)
    if (!is.null(params$bg)) {
      do.call("bg3d", params$bg)
      params$bg <- NULL
    }
    if (!is.null(params$material)) {
      do.call("material3d", params$material)
      params$material <- NULL
    }
    do.call("par3d", params)   
    return(rgl.cur())
}

.check3d <- function() {
    if (result<-rgl.cur()) return(result)
    else return(open3d())
}