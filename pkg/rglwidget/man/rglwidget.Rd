\name{rglwidget}
\alias{rglwidget}
\title{
An htmlwidget to hold an rgl scene.
}
\description{
The \pkg{htmlwidgets} package provides a framework for embedding
graphical displays in HTML documents of various types.  This function
provides the necessities to embed an \pkg{rgl} scene in one.
}
\usage{
rglwidget(x = scene3d(), width = NULL, height = NULL,
          controllers = NULL, snapshot = FALSE,
          elementId = NULL, reuse = !interactive(), ...)
}
\arguments{
  \item{x}{
An \pkg{rgl} scene produced by the \code{\link[rgl]{scene3d}} function.
}
  \item{width, height}{
The width and height of the display in pixels.
}
  \item{controllers}{Names of \code{\link{rglcontroller}} objects
associated with this scene.  See Details below.
}
  \item{snapshot}{Control of snapshot of scene.  See
\code{\link{writeWebGL}} for details.
}
  \item{elementId}{The id to use on the HTML \code{div}
component that will hold the scene.
}
  \item{reuse}{A logical variable indicating whether
rgl objects from earlier scenes should be referenced. See
the Details below.
}
  \item{...}{Additional arguments
to pass to \code{htmlwidgets::\link{createWidget}}.}
}
\details{
This produces a WebGL version of an \pkg{rgl} scene using the \pkg{htmlwidgets}
framework.  This allows display of the scene in an \pkg{rmarkdown} document
or in a \pkg{shiny} app.

In a \pkg{shiny} app, there will often be one or more
\code{\link{rglcontroller}} objects in the app, taking input from
the user.  In order to be sure that the initial value of the user control
is reflected in the scene, you should list all controllers in the
\code{controllers} argument.  See the sample application in
\code{system.file("shinyDemo", package = "rglwidget")} for an example.

If the \code{reuse} argument is \code{FALSE} (the default in interactive
use), earlier information will be
cleared before drawing the new scene.  If \code{TRUE}, earlier
data will be re-used in the current scene, so it may be smaller
and faster to load.  In both cases information from the current
scene (added to earlier information if \code{reuse=TRUE}) will
be saved for possible use in a future scene.
If \code{reuse=NA}, the saved information will neither be used
nor updated.

If \code{elementId} is \code{NULL} and we are not in a Shiny app,
\code{elementId} is set to a random value to facilitate re-use
of information.
}
\value{
An object of class htmlwidget that will intelligently print itself into
HTML in a variety of contexts including the R console, within R Markdown
documents, and within Shiny output bindings.

It should also display
in the RStudio viewer.

If \code{reuse = TRUE}, a record will be kept of objects in the scene
and they need not be included in the HTML generated for later scenes.
This is normally useful only in \pkg{knitr} documents which can have
many \pkg{rgl} scenes; if the widget is displayed in RStudio,
only one scene will be shown.
}
\author{
Duncan Murdoch
}
\seealso{
\code{\link[rgl]{hook_webgl}} for an earlier approach to this problem. \code{\link{rglwidgetOutput}} for Shiny details.
}
\examples{
save <- getOption("rgl.useNULL")
options(rgl.useNULL=TRUE)
example("plot3d", "rgl")
rglwidget()
}

