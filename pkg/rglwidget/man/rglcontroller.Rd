\name{rglcontroller}
\alias{rglcontroller}
\title{
Provide a link to a Shiny control.
}
\description{
This function produces an object which can be used in the output
of a Shiny app, to control an \code{\link{rglwidget}}.
}
\usage{
rglcontroller(sceneId, ..., elementId = NULL, respondTo = NULL)
}
\arguments{
  \item{sceneId}{
The name of the \code{\link{rglwidget}} to control.
}
  \item{elementId}{
The HTML id to use for the control.}
  \item{respondTo}{
The Id of an input control (e.g. a \code{\link[shiny]{sliderInput}}
control) to respond to.}
  \item{\dots}{
A number of setter functions, e.g. \code{\link{subsetSetter}}.
}
}
\details{
See the sample application in
\code{system.file("shinyDemo", package = "rglwidget")} for an example.


}
\value{
An object of class htmlwidget that will invisibly control an
\code{\link{rglwidget}} object.
}
\author{
Duncan Murdoch
}

\seealso{
\code{\link{rglwidget}}, \code{\link{subsetSetter}}.
}
\examples{
# Similar code to this code appears in the Shiny demo app.

renderRglcontroller(rglcontroller("thewidget",
                    subsetSetter(0,
                                 subsets = unname(as.list(0:3)),
                                 accumulate = TRUE)))
}
