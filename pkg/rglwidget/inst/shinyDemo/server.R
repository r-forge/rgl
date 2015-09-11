library(shiny)
library(rgl)
library(rglwidget)

options(rgl.useNULL = TRUE)
open3d()
id <- text3d(1:4, rnorm(4), rnorm(4), letters[1:4], font=1:4, col = c("black", "black"),
             family=c("sans", "serif"), cex=1:4)
x <- scene3d()

shinyServer(function(input, output) {
  output$thewidget <- renderRglwidget(rglwidget(x, controllers="thecontroller"))
  output$thecontroller <-
    renderRglcontroller(rglcontroller("thewidget", respondTo = "Slider",
                          ageControl(births=rep(1, 4),
                                     ages = c(-2,0,2),
                                     color = c("red", "green", "blue"),
                                     objids = id)))
})
