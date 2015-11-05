\name{playwidget}
\alias{playwidget}
\title{
Add a widget to play animations.
}
\description{
This is a widget that can be put in a web page to allow
animations without needing Shiny.
}
\usage{
playwidget(sceneId, ...,
            start = 0, stop = Inf, interval = 0.05, rate = 1,
            components = c("Reverse", "Play", "Slower", "Faster",
                           "Reset", "Slider", "Label"),
            loop = TRUE,
            step = 1, labels = seq(from = start, to = stop, by = step),
            precision = 3, width = "auto",
            elementId = NULL, respondTo = NULL)
}
\arguments{
  \item{sceneId}{
The HTML id of the rgl scene being controlled.
}
  \item{\dots}{
A number of controller functions, e.g. \code{\link{propertyControl}}.
}
  \item{start, stop}{
The starting and stopping values of the animation.
}
  \item{interval}{
The requested interval (in seconds) between updates.  Updates
may occur at longer intervals.
}
  \item{rate}{
The number of units of \dQuote{nominal} time per real world
second.
}
  \item{components}{
Which components should be displayed?  See Details below.
}
  \item{loop}{
When the player reaches the end of the interval,
should it loop back to the beginning?
}
  \item{step}{
Step size in the slider.
}
  \item{labels}{
Optional labels to use, corresponding to slider steps.  Set to
\code{NULL} for auto-generated labels.
}
  \item{precision}{
If \code{labels=NULL}, the precision to use when displaying
timer values.
}
  \item{width}{
The CSS specification for the width of the slider.
}
  \item{elementId}{
The HTML id of the generated widget, containing buttons,
slider, etc.
}

  \item{respondTo}{
The HTML ID of an input control (e.g. a \code{\link[shiny]{sliderInput}}
control) to respond to.}
}
\details{
The \code{components} are buttons to control the animation,
a slider for manual control, and a label to show the current
value.  They will be displayed in the order given in \code{components}.  Not all need be included.

The buttons have the following behaviour:
\describe{
\item{Reverse}{Reverse the direction.}
\item{Play}{Play the animation.}
\item{Slower}{Decrease the playing speed.}
\item{Faster}{Increase the playing speed.}
\item{Reset}{Stop the animation and reset to the start value.}
}

If \code{respondTo} is used, the \code{components} are cleared.
It makes more sense to use \code{\link{rglcontroller}}.
}
\value{
A widget suitable for use in an \pkg{Rmarkdown}-generated web
page.
}
\author{
Duncan Murdoch
}
\seealso{
\code{\link{rglcontroller}} for embedding controls in a Shiny
app. \code{\link{subsetControl}},
\code{\link{propertyControl}}, \code{\link{ageControl}} and
\code{\link{vertexControl}} are possible controls to use.
}
\examples{
saveopts <- options(rgl.useNULL = TRUE)
example("plot3d", "rgl")
rglwidget(elementId = "theplot")
control <- ageControl(value=0,
             births=rep(0, 21),
             ages = c(-5,0,5),
             colors = c("green", "yellow", "red"),
             objids = 123)
playwidget("theplot", control, start = -5, stop = 5, rate = 3, loop = TRUE)
options(saveopts)
}
