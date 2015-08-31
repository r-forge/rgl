library(shiny)
library(rglwidget)

shinyUI(pageWithSidebar(
  headerPanel("Shiny with plot3d"),
  sidebarPanel(
    uiOutput("outputSlider")
  ),
  mainPanel(rglwidgetOutput('thewidget'),
    rglcontrollerOutput('thecontroller')
  )
))
