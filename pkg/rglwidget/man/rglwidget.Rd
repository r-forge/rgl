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
rglwidget(x = scene3d(), width = NULL, height = NULL)
}
%- maybe also 'usage' for other objects documented here.
\arguments{
  \item{x}{
An \pkg{rgl} scene produced by the \code{\link[rgl]{scene3d}} function.
}
  \item{width, height}{
The width and height of the display in pixels.
}
}
\details{
This is currently very preliminary.
}
\value{
An object of class htmlwidget that will intelligently print itself into
HTML in a variety of contexts including the R console, within R Markdown
documents, and within Shiny output bindings.
}
\author{
Duncan Murdoch
}
\seealso{
\code{\link[rgl]{hook_webgl}} for an earlier approach to this problem.
}
\examples{
save <- getOption("rgl.useNULL")
options(rgl.useNULL=TRUE)
example(plot3d)
rglwidget()
}

