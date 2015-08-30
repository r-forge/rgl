\name{shiny}
\alias{rglwidgetOutput}
\alias{renderRglwidget}
\title{
Functions for integration of \code{\link{rglwidget}} into
Shiny app.
}
\description{
These functions allow an \pkg{rgl} scene to be embedded
in a Shiny app.
}
\usage{
rglwidgetOutput(outputId, width = "100\%", height = "400px")
renderRglwidget(expr, env = parent.frame(), quoted = FALSE)
}
\arguments{
  \item{outputId}{
The name for the \code{rglwidget()} control.
}
  \item{width, height}{
Width and height to display the control.
}
  \item{expr}{An R expression returning
a \code{\link{rglwidget}} as output.}
  \item{env}{The environment in which to evaluate \code{expr}.}
  \item{quoted}{Is the expression already quoted?}
}
\details{
Use \code{rglwidgetOutput} as an output object in a Shiny user
interface section; use \code{renderRglwidget} as the render
function in the server section.
}
\value{
Used internally by Shiny.
}
\author{
Duncan Murdoch
}
\seealso{
\code{\link[shiny]{shinyWidgetOutput}}
}
