library(shiny)
library(rglwidget)

shinyUI(pageWithSidebar(
  headerPanel("Shiny with plot3d"),
  sidebarPanel(
    sliderInput("Slider", min=-10, max=10, value=0, label="Slider")
  ),
  mainPanel(rglwidgetOutput('thewidget'),
    rglcontrollerOutput('thecontroller')
  )
))
