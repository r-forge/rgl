\name{webGLcontrols}
\alias{subsetControl}
\title{
Controls to use with rglcontroller.
}
\description{
This is a setter function to produce actions in a Shiny app.
}
\usage{
subsetControl(value, subsets, subscenes = NULL,
                         fullset = Reduce(union, subsets),
                         accumulate = FALSE)
}
\arguments{
  \item{value}{The value to use for input (typically \code{input$value}
  in a Shiny app.}
  \item{subsets}{A list of vectors of object identifiers; the value will
  choose among them.}
  \item{fullset}{Objects in the subscene which are not in \code{fullset}
  will not be touched.}
  \item{subscenes}{The subscenes to be controlled.  If \code{NULL}, the
  root subscene.}
  \item{accumulate}{If \code{TRUE}, the subsets will accumulate (by union)
  as the value increases.}
}
\details{
\code{subsetControl} produces data for \code{\link{rglcontroller}} to
display subsets of the object in one or more subscenes.  This code will not
touch objects in the
subscenes if they
are not in \code{fullset}.  \code{fullset} defaults to the union of
all the object ids mentioned in \code{subsets}, so by default if an id is
not mentioned in one of the subsets, it will not be controlled by the slider.
}
\value{
\code{subsetControl} returns controller data in a list.
}
\author{
Duncan Murdoch
}

\seealso{
\code{\link{rglcontroller} for how to embed this in a Shiny app,
\code{\link[rgl]{subsetSetter}} for a way to embed a pure Javascript
control.
}
