\name{spin3d}
\alias{spin3d}
\title{Create TCL/TK controller for rgl window}
\description{
  This function creates a TCL/TK window containing buttons to spin and 
  resize one or more rgl windows.
}
\usage{
spin3d(dev = rgl.cur(), ...)
}
\arguments{
  \item{dev}{A vector of one or more rgl device numbers to control }
  \item{...}{Arguments to pass to \code{\link{spinControl}} }
}
\author{ Ming Chen and Duncan Murdoch }
\seealso{ \code{\link{spinControl}}}
\examples{
if (interactive()) {
    library(rgl)
    open3d()
    rgl.bringtotop(TRUE)
    points3d(rnorm(100), rnorm(100), rnorm(100), size=3)
    axes3d()
    box3d()
    tkrgl::spin3d()  # rgl also has a function called spin3d!
}
}
\keyword{ dynamic }
