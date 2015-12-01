\name{playwidget}
\alias{playwidget}
\title{
Add a widget to play animations.
}
\description{
This is a widget that can be put in a web page to allow
animations with or without Shiny.
}
\usage{
playwidget(sceneId, controls,
            start = 0, stop = Inf, interval = 0.05, rate = 1,
            components = c("Reverse", "Play", "Slower", "Faster",
                           "Reset", "Slider", "Label"),
            loop = TRUE,
            step = 1, labels = NULL,
            precision = 3,
            elementId = NULL, respondTo = NULL,
            reinit = NULL,
            ...)
}
\arguments{
  \item{sceneId}{
The HTML id of the rgl scene being controlled.
}
  \item{controls}{
A single \code{"rglControl"} object, e.g. \code{\link{propertyControl}}, or a list of several.
}
  \item{start, stop}{
The starting and stopping values of the animation.  If
\code{labels} is supplied \code{stop} will default to step
through the labels.
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
  \item{elementId}{
The HTML id of the generated widget, containing buttons,
slider, etc.
}
  \item{respondTo}{
The HTML ID of a Shiny input control (e.g. a \code{\link[shiny]{sliderInput}}
control) to respond to.}

  \item{reinit}{
A vector of ids that will need re-initialization before
being drawn again.
}

  \item{...}{Additional arguments
to pass to \code{htmlwidgets::\link{createWidget}}.}
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

If \code{respondTo} is used, no \code{components} are shown, as Shiny will provide the UI components.
}
\section{Appearance}{
The appearance of the controls is set by the stylesheet
in \code{system.file("htmlwidgets/lib/rglClass/rgl.css")}.

The overall widget is of class \code{rglPlayer}, with id
set according to \code{elementId}.

The buttons are of HTML class \code{rgl-button}, the
slider is of class \code{rgl-slider}, and the label is of
class \code{rgl-label}.  Each element has an id prefixed
by the widget id, e.g. \code{elementId-button-Reverse},
\code{elementId-slider}, etc. (where \code{elementId}
should be replaced by the actual id).

The \code{reinit} parameter handles the case where
an object needs re-initialization after each change.  For
example, plane objects may need this if their intersection
with the bounding box changes shape.  Note that
re-initialization is generally incompatible with
the \code{\link{vertexControl}} as it modifies values
which are set during initialization.
}
\value{
A widget suitable for use in an \pkg{Rmarkdown}-generated web
page.
}
\author{
Duncan Murdoch
}
\seealso{
\code{\link{subsetControl}},
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
