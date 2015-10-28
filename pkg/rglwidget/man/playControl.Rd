\name{playControl}
\alias{playControl}
\title{
Add a control to play animations.
}
\description{
This is a control that can be put in a web page to allow
animations.
}
\usage{
playControl(...,
            start = 0, stop = Inf, interval = 0.05, rate = 1,
            buttons = c("Reverse", "Play", "Pause", "Forward", "Stop"),
            loop = FALSE)
}
%- maybe also 'usage' for other objects documented here.
\arguments{
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
  \item{buttons}{
Which buttons should be displayed?
}
  \item{loop}{
When the player reaches the end of the interval,
should it loop back to the beginning?
}
}
\details{
The buttons will be displayed in the order given in \code{buttons}.
They have the following behaviour:
\describe{
\item{Reverse}{Play the animation in reverse.  Hit it
again for higher speed.}
\item{Play}{Play forward at normal speed.}
\item{Pause}{Pause the animation.}
\item{Forward}{Increase the forward playing speed.}
\item{Stop}{Stop the animation and reset to the start value.}
}
}
\value{
A list suitable for use in \code{\link{rglcontroller}}.
}
\author{
Duncan Murdoch
}
\seealso{
\code{\link{rglcontroller}} for embedding this in a Shiny
app or \pkg{knitr} document; \code{\link{subsetControl}},
\code{\link{propertyControl}}, \code{\link{ageControl}} and
\code{\link{vertexControl}} are possible controls to use.
}
\examples{
control <- ageControl(value=0,
             births=rep(0, 21),
             ages = c(-5,0,5),
             colors = c("green", "yellow", "red"),
             objids = 123)
playControl(control, start = -5, stop = 5, rate = 3, loop = TRUE)
}
