
rglwidget <- function(x = scene3d(), width = NULL, height = NULL,
                      elementId = NULL) {

  # create widget
  htmlwidgets::createWidget(
    name = 'rglwidget',
    x = convertScene(x, width, height),
    width = width,
    height = height,
    elementId = elementId,
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

rglwidget_html <- function(id, style, class, ...) {
  htmltools::tags$canvas(id = id, class = class, ...)
}

rglcontroller <- function(sceneId, ...) {

  # create widget
  htmlwidgets::createWidget(
    name = 'rglcontroller',
    x = c(list(sceneId = sceneId), ...),
    width = 0,
    height = 0,
    package = 'rglwidget'
  )
}

#' Widget output function for use in Shiny
#'
#' @export
rglcontrollerOutput <- function(outputId, width = '0px', height = '0px'){
  shinyWidgetOutput(outputId, 'rglcontroller', width, height, package = 'rglwidget')
}

#' Widget render function for use in Shiny
#'
#' @export
renderRglcontroller <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  shinyRenderWidget(expr, rglwidgetOutput, env, quoted = TRUE)
}
