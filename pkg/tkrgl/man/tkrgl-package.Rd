\name{tkrgl-package}
\alias{tkrgl-package}
\alias{tkrgl}
\docType{package}
\title{
TK widget tools for rgl package
}
\description{
This package provides a TK spin control for the rgl package.  
}
\details{
\tabular{ll}{
Package: \tab tkrgl\cr
Version: \tab 0.3\cr
License: \tab GPL\cr
Depends: \tab R (>= 1.9.0), tcltk, rgl (>= 0.66)\cr
SystemRequirements: \tab rgl packages for rendering\cr
URL: \tab \url{http://www.stats.uwo.ca/faculty/murdoch}\cr
}

History:
\tabular{ll}{
0.2-2 \tab First public release \cr
0.3   \tab Added possibility to control multiple windows \cr
0.4   \tab Compatibility with 2.0.0 tcltk package \cr
0.5   \tab Added continuous rotation \cr
0.6   \tab Added par3dsave \cr
0.7   \tab Added parameters to \code{\link{spinControl}}, fixed startup \cr
}

Index:
\tabular{ll}{
\code{\link{spin3d}} \tab   Create TCL/TK controller for rgl window(s) \cr
\code{\link{spinControl}} \tab Create a spin control in a TCL/TK window \cr
\code{\link{par3dsave}} \tab Save viewpoints for playback
}
}
\author{
Duncan Murdoch/Ming Chen

Maintainer: Duncan Murdoch <dmurdoch@pair.com>
}
\keyword{ package }
