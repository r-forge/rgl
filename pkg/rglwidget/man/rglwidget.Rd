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
          controllers = NULL, snapshot = FALSE)
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
\code{\link{writeWebGL2}} for details.}
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
}
\value{
An object of class htmlwidget that will intelligently print itself into
HTML in a variety of contexts including the R console, within R Markdown
documents, and within Shiny output bindings.

It should also display
in the RStudio viewer, but as of RStudio version 0.99.467 the viewer
does not support WebGL.
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
example(plot3d)
rglwidget()
}

