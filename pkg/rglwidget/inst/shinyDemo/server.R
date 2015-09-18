library(shiny)
library(rgl)
library(rglwidget)

options(rgl.useNULL = TRUE)
open3d()
id <- plot3d((-10):10, rnorm(21), rnorm(21), col = c("black", "black"),
             size = 10)["data"]
print(id)
x <- scene3d()

shinyServer(function(input, output) {
  output$thewidget <- renderRglwidget(rglwidget(x, controllers="thecontroller"))
  output$thecontroller <-
    renderRglcontroller(rglcontroller("thewidget", respondTo = "Slider",
                          ageControl(births=(-10):10,
                                     ages = c(-5,0,5),
                                     color = c("red", "green", "blue"),
                                     objids = id),
                          vertexControl(values = 2*(5:(-5)), param = 2*((-5):5),
                             vertices = 11, attributes="x", objid=id)))
})
