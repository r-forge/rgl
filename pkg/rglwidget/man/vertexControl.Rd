\name{vertexControl}
\alias{vertexControl}
\title{
Set attributes of vertices.
}
\description{
This is a function to produce actions in a Shiny app.  A Shiny
input control (e.g. a \code{\link[shiny]{sliderInput}} control)
sets a value which controls attributes of a selection of vertices.
}
\usage{
vertexControl(value = 0, values = NULL, vertices = 1, attributes,
              objid, param = seq_len(NROW(values)) - 1, interp = TRUE)
}
\arguments{
  \item{value}{The value to use for input (typically \code{input$value}
  in a Shiny app.)}
  \item{values}{
A matrix of values, each row corresponding to an input value.
}
  \item{vertices}{
Which vertices are being controlled?  Specify \code{vertices} as a number from 1 to
the number of vertices in the \code{objid}.
}
  \item{attributes}{A vector of attributes of a vertex,
  from \code{c("x", "y", "z", "red", "green", "blue", "alpha", "nx", "ny", "nz",
               "radius", "ox", "oy", "oz", "ts", "tt")}.  See
               Details.}
  \item{objid}{
A single \pkg{rgl} object id.
}
  \item{param}{
Parameter values corresponding to each row of \code{values}.
}
  \item{interp}{
Whether to interpolate between rows of \code{values}.
}
}
\details{
Like \code{rgl::\link[rgl:propertySetter]{vertexSetter}}, this function
modifies attributes of vertices in a single
object.  The \code{attributes} are properties of each vertex
in a scene; not all are applicable to all objects. In order,
they are: coordinates of the vertex \code{"x", "y", "z"}, color
of the vertex \code{"red", "green", "blue", "alpha"}, normal at the vertex
\code{"nx", "ny", "nz"}, radius of a sphere at the vertex
\code{"radius"}, origin within a texture \code{"ox", "oy"} and
perhaps \code{"oz"}, texture coordinates \code{"ts", "tt"}.

If only one attribute of one vertex is specified, \code{values} may
be given as a vector and will be treated as a one-column matrix.  Otherwise
\code{values} must be given as a matrix with \code{ncol(values) == max(length(vertices),
length(attributes))}.

The \code{value} argument is translated into a row (or two rows if
\code{interp = TRUE}) of \code{values}
by finding its location in \code{param}.
}
\value{
A list of class \code{"rglControl"} of cleaned up parameter
values, to be used in an rgl widget.
}
\author{
Duncan Murdoch
}

\examples{
  library(rgl)
  saveopts <- options(rgl.useNULL = TRUE)
  open3d()
  ids <- plot3d((-10):10, rnorm(21), rnorm(21))
  vertexControl(values = 10:(-10),
                vertices = 11, attributes="x", objid=ids["data"])
  options(saveopts)
}
