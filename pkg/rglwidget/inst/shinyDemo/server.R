library(shiny)
library(rgl)
library(rglwidget)

options(rgl.useNULL = TRUE)
open3d()
example(plot3d)
x <- scene3d()
ids <- names(x$objects)

shinyServer(function(input, output) {
  output$thewidget <- renderRglwidget(rglwidget(x, controllers="thecontroller"))
  output$thecontroller <-
    renderRglcontroller(rglcontroller("thewidget",
                          subsetSetter(input$chooseSubset,
                                       subsets = unname(as.list(ids)),
                                       accumulate = TRUE)))
  output$outputSlider <- renderUI({
    sliderInput("chooseSubset", "Choose subset", min=1, max=length(ids),
                round = TRUE, value = 0, step = 1)
  })
})
