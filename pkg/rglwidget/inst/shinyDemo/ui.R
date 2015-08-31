library(shiny)
library(rglwidget)

shinyUI(pageWithSidebar(
  headerPanel("Shiny with rglwidget"),
  sidebarPanel(
    sliderInput("chooseSubset", "Choose Subset", min=0, max=2,
                value=0, animate = TRUE)
  ),
  mainPanel(rglwidgetOutput('thewidget'),
    rglcontrollerOutput('thecontroller')
  )
))
