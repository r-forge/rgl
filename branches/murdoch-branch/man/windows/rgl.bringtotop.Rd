\name{rgl.bringtotop}
\alias{rgl.bringtotop}
\title{Assign focus to an RGL window }
\description{
'rgl.bringtotop' brings the specified RGL window to the
front of the window stack (and gives it focus).}
\usage{
rgl.bringtotop()
}
\author{ Ming Chen/Duncan Murdoch }
\seealso{ \code{\link[graphics]{bringToTop}}}
\examples{
rgl.clear()
rgl.points(rnorm(1000), rnorm(1000), rnorm(1000), color=heat.colors(1000), size=2)
rgl.bringtotop()    
}
\keyword{ dynamic }
