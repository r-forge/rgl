library(shiny)
library(rglwidget)

shinyUI(fluidPage(
  mainPanel(
  tabsetPanel(
    tabPanel("red",
      rglwidgetOutput('thewidget1')),
    tabPanel("green",
      rglwidgetOutput('thewidget2'))
  ))
))
