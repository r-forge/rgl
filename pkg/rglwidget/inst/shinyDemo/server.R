library(shiny)
library(rgl)
library(rglwidget)

options(rgl.useNULL = TRUE)
open3d()
ids <- plot3d((-10):10, rnorm(21), rnorm(21), col=rainbow(21), size=20)
x <- scene3d()

shinyServer(function(input, output) {
  output$thewidget <- renderRglwidget(rglwidget(x, controllers="thecontroller"))
  output$thecontroller <-
    renderRglcontroller(rglcontroller("thewidget",
                          ageControl(value=input$setValue, births=c((-10):10),
                                          ages = c(-5,0,5),
                                          colors = c("green", "yellow", "red"),
                                          objids = ids["data"])))
  output$outputSlider <- renderUI({
    sliderInput("setValue", "Set Time", min=-10, max=10,
                 value = 0, step=0.1)
  })
})
