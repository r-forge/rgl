rglcontroller <- function(sceneId, ...) {

  # create widget
  controls = list(...)

  htmlwidgets::createWidget(
    name = 'rglcontroller',
    x = list(sceneId = sceneId, controls=controls),
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

subsetSetter <- function(value, subsets, subscenes = currentSubscene3d(),
                         fullset = Reduce(union, subsets),
                         accumulate = FALSE) {
  list(type = "subsetSetter",
       value = value,
       subsets = subsets,
       subscenes = subscenes,
       fullset = fullset,
       accumulate = accumulate)
}
