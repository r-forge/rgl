\name{points3d}
\alias{points3d}
\alias{lines3d}
\alias{segments3d}
\alias{triangles3d}
\alias{quads3d}
\title{add primitive set shape}
\description{
Adds a shape node to the current scene
}
\usage{
points3d(x, y, z,  ...)
lines3d(x, y, z,  ...)
segments3d(x, y, z, ...)
triangles3d(x, y, z, ...)
quads3d(x, y, z, ...)
}
\\arguments{
  \item{x, y, z}{coordinates}
  \item{ ... }{Material properties. See \code{\link{rgl.material}} for details.}  
}
\details{
  Adds a shape node to the scene. The appearance is defined by the material properties.
  See \code{\link{rgl.material}} for details.
}

\details{
The functions \code{points3d}, \code{lines3d}, \code{segments3d},
\code{triangles3d} and \code{quads3d} add points, joined lines, line segments,
filled triangles or quadrilaterals to the plots.  They correspond to the OpenGL types
\code{GL_POINTS, GL_LINE_STRIP, GL_LINES, GL_TRIANGLES} and \code{GL_QUADS} respectively.  

Points are taken in pairs by \code{segments3d}, triplets as the vertices
of the triangles, and quadruplets for the quadrilaterals.  Colours are applied vertex by vertex; 
if different at each end of a line segment, or each vertex of a polygon, the colours
are blended over the extent of the object.  Quadrilaterals must be entirely 
in one plane, or the results are undefined.
}
\author{
  Duncan Murdoch
}

\examples{
rgl.clear()
points3d(rnorm(1000), rnorm(1000), rnorm(1000), color=heat.colors(1000), size=2)
}
\keyword{dynamic}
