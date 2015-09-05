library(shiny)
library(rglwidget)

shinyUI(pageWithSidebar(
  headerPanel("Shiny with plot3d"),
  sidebarPanel(
    sliderInput("Slider", min=-10, max=10, step=0.2, value=-10, label="Slider",
                animate=animationOptions(100, loop=TRUE))
  ),
  mainPanel(rglwidgetOutput('thewidget'),
    rglcontrollerOutput('thecontroller')
  )
))
