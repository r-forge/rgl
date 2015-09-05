\name{ageControl}
\alias{ageControl}
\title{
Set attributes of vertices based on their age.
}
\description{
This is a function to produce actions in a Shiny app.  The
mental model is that all of the vertices of some object have
a certain birth time; a control sets the current time, so that
vertices have ages depending on the control setting.
Attributes of those vertices can then be changed.
}
\usage{
ageControl(value, births, ages,
           colors = NULL, alpha = NULL, radii = NULL, vertices = NULL,
           normals = NULL, origins = NULL, texcoords = NULL, objids)
}
\arguments{
  \item{value}{The value to use for input (typically \code{input$value}
  in a Shiny app.}
  \item{births}{Numeric birth times of vertices.}
  \item{ages}{Chosen ages at which the following attributes
  will apply.}
  \item{colors, alpha, radii, vertices, normals, origins, texcoords}{
  Attributes of the vertices that can be changed.  There should be
  one entry or row for each entry in \code{ages}.}
  \item{objids}{Object ids to which the changes apply.}
}
\details{
All attributes must have the same number of entries (rows for the matrices)
as the ages vector. The births vector must have the same number of entries as
the number of vertices in the object.

Not all objects contain all attributes; if one is chosen that is
not a property of the corresponding object, a Javascript alert() will be
generated.  (This restriction may be removed in the future.)
}
\value{
A list of cleaned up parameter values, to be used in an rgl controller.
}
\author{
Duncan Murdoch
}

\examples{
  library(rgl)
  saveopts <- options(rgl.useNULL = TRUE)
  open3d()
  ids <- plot3d((-10):10, rnorm(21), rnorm(21))
  ageControl(value=0,
             births=c((-10):10),
             ages = c(-5,0,5),
             colors = c("green", "yellow", "red"),
             objids = ids["data"])
}
