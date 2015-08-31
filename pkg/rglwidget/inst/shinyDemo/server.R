library(shiny)
library(rglwidget)

options(rgl.useNULL = TRUE)
example(sprites3d)

shinyServer(function(input, output) {
  output$thewidget <- renderRglwidget(rglwidget(controllers="thecontroller"))
  output$thecontroller <-
    renderRglcontroller(rglcontroller("thewidget",
                          subsetSetter(input$chooseSubset,
                                       subsets = list(7,8,10))))
})
