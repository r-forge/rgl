
rglwidget <- function(x = scene3d(), width = NULL, height = NULL,
                      controllers = NULL) {
  x = convertScene(x, width, height)
  if (!is.null(controllers))
    x$controllers = controllers
  # create widget
  htmlwidgets::createWidget(
    name = 'rglwidget',
    x = x,
    width = width,
    height = height,
    package = 'rglwidget'
  )
}

#' Widget output function for use in Shiny
#'
#' @export
rglwidgetOutput <- function(outputId, width = '512px', height = '512px'){
  shinyWidgetOutput(outputId, 'rglwidget', width, height, package = 'rglwidget')
}

#' Widget render function for use in Shiny
#'
#' @export
renderRglwidget <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  shinyRenderWidget(expr, rglwidgetOutput, env, quoted = TRUE)
}

rglwidget_html <- function(id, style, class, ...) {
  htmltools::tags$canvas(id = id, class = class, ...)
}
