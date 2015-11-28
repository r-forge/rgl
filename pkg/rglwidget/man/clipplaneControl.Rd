\name{clipplaneControl}
\alias{clipplaneControl}
\title{
Sets attributes of a clipping plane.
}
\description{
This is a function to produce actions in a web display.  A
\code{\link{playwidget}} or Shiny
input control (e.g. a \code{\link[shiny]{sliderInput}} control)
sets a value which controls attributes of one or more clipping
planes.
}
\usage{
clipplaneControl(a = NULL, b = NULL, c = NULL, d = NULL, plane = 1, clipplaneids, ...)
}
\arguments{
  \item{a, b, c, d}{
Parameter values for the clipping planes.
}
  \item{plane}{
Which plane in the clipplane object?
}
  \item{clipplaneids}{
The id of the clipplane object.
}
  \item{\dots}{
Other parameters passed to \code{\link{propertyControl}}.
}
}
\value{
A list of class \code{"rglControl"} of cleaned up parameter
values, to be used in an rgl widget.
}
\author{
Duncan Murdoch
}
