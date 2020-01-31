\name{tkrgl-package}
\alias{tkrgl-package}
\alias{tkrgl}
\alias{par3dsave}
\alias{spin3d}
\alias{spinControl}
\title{
\packageTitle{tkrgl}
}
\description{Deprecated package of TCL/TK controls for \pkg{rgl}}
\usage{
par3dsave(params = c("userMatrix", "scale", "zoom", "FOV"),
          times = FALSE, dev = rgl.cur(), ...)
spin3d(dev = rgl.cur(), ...)
spinControl(base, dev = rgl.cur(), 
	continue=FALSE, speed=30, scale=100, ... )
}
\arguments{
  \item{params, times, dev, base, continue, speed, scale, ...}{
  Please see the help in \pkg{rgl}}
}
\details{
This package is no longer maintained.  The functions have been moved
to \pkg{rgl}, with the names prefixed by \sQuote{tk}:
\describe{
\item{\code{\link[rgl]{tkpar3dsave}}}{Formerly \code{par3dsave}.}
\item{\code{\link[rgl]{tkspin3d}, \link[rgl]{tkspinControl}}}{Formerly 
\code{spin3d} and \code{spinControl}.}
}

History:
\tabular{ll}{
0.2-2 \tab First public release \cr
0.3   \tab Added possibility to control multiple windows \cr
0.4   \tab Compatibility with 2.0.0 tcltk package \cr
0.5   \tab Added continuous rotation \cr
0.6   \tab Added par3dsave \cr
0.7   \tab Added parameters to \code{\link{spinControl}}, fixed startup \cr
0.8   \tab Minor fixes to pass checks \cr
0.9   \tab Functions moved to \pkg{rgl} \cr
}
}

\examples{
example("tkspinControl", package = "rgl")
}
