library(shiny)
library(rgl)
library(rglwidget)

options(rgl.useNULL = TRUE)
open3d()
plot3d((-10):10, rnorm(21), rnorm(21))
x <- scene3d()
ids <- names(x$objects)

shinyServer(function(input, output) {
  output$thewidget <- renderRglwidget(rglwidget(x, controllers="thecontroller"))
  output$thecontroller <-
    renderRglcontroller(rglcontroller("thewidget",
                          propertyControl(value=input$setValue, values=c(-10,10),
                                          param=c(-10,10), entries=0, properties="values",
                                          objids = ids[1], interp = TRUE)))
  output$outputSlider <- renderUI({
    sliderInput("setValue", "Set Value", min=-10, max=10,
                 value = 0, step=0.1)
  })
})
