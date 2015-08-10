
rglwidget <- function(scene, width = NULL, height = NULL) {

  makeList <- function(x) {
    if (is.list(x)) x <- lapply(x, makeList)
    if (length(names(x))) x <- as.list(x)
    x
  }
  scene <- makeList(scene)

  # create widget
  htmlwidgets::createWidget(
    name = 'rglwidget',
    scene,
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
