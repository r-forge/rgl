
rglwidget <- function(width = NULL, height = NULL) {

  # create widget
  htmlwidgets::createWidget(
    name = 'rglwidget',
    x = convertScene(width, height),
    width = width,
    height = height,
    package = 'rglwidget'
  )
}

#' Widget output function for use in Shiny
#'
#' @export
rglwidgetOutput <- function(outputId, width = '100%', height = '400px'){
  shinyWidgetOutput(outputId, 'rglwidget', width, height, package = 'rglwidget')
}

#' Widget render function for use in Shiny
#'
#' @export
renderRglwidget <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  shinyRenderWidget(expr, rglwidgetOutput, env, quoted = TRUE)
}

# rglwidget_html <- function(id, style, class, ...) {
#   htmltools::tags$canvas(id = id, class = class)
# }
