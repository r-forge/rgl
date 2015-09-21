rglcontroller <- function(sceneId, ..., respondTo = NULL) {

  # create widget
  controls = list(...)

  htmlwidgets::createWidget(
    name = 'rglcontroller',
    x = list(sceneId = sceneId, respondTo = respondTo, controls=controls),
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

subsetControl <- function(value, subsets, subscenes = NULL,
                         fullset = Reduce(union, subsets),
                         accumulate = FALSE) {
  subsets <- lapply(subsets, as.integer)
  fullset <- as.integer(fullset)
  list(type = "subsetSetter",
       value = value,
       subsets = subsets,
       subscenes = subscenes,
       fullset = fullset,
       accumulate = accumulate)
}

propertyControl <- function(value, entries, properties, objids, values = NULL,
                            param = seq_len(NROW(values)), interp = TRUE) {
  objids <- as.integer(objids)
  list(type = "propertySetter",
       value = value,
       values = values,
       entries = entries,
       properties = properties,
       objids = objids,
       param = param,
       interp = interp)
}

ageControl <- function(births, ages, objids, value = 0, colors = NULL, alpha = NULL,
                       radii = NULL, vertices = NULL, normals = NULL,
                       origins = NULL, texcoords = NULL,
                       x = NULL, y = NULL, z = NULL,
                       red = NULL, green = NULL, blue = NULL) {

  lengths <- c(colors = NROW(colors), alpha = length(alpha),
               radii = length(radii), vertices = NROW(vertices),
               normals = NROW(normals), origins = NROW(origins),
               texcoords = NROW(texcoords),
               x = length(x), y = length(y), z = length(z),
               red = length(red), green = length(green), blue = length(blue))
  lengths <- lengths[lengths > 0]
  n <- unique(lengths)
  stopifnot(length(n) == 1, n == length(ages), all(diff(ages) >= 0))

  ages <- c(-Inf, ages, Inf)
  rows <- c(1, 1:n, n)

  result <- list(type = "ageSetter",
                 objids = as.integer(objids),
                 value = value,
                 births = births,
                 ages = ages)

  if (!is.null(colors)) {
    colors <- col2rgb(colors)/255
    colors <- as.numeric(colors[,rows])
    result <- c(result, list(colors = colors))
  }

  if (!is.null(alpha))
    result <- c(result, list(alpha = alpha[rows]))

  if (!is.null(radii))
    result <- c(result, list(radii = radii[rows]))

  if (!is.null(vertices)) {
    stopifnot(ncol(vertices) == 3)
    result <- c(result, list(vertices = as.numeric(t(vertices[rows,]))))
  }

  if (!is.null(normals)) {
    stopifnot(ncol(normals) == 3)
    result <- c(result, list(normals = as.numeric(t(normals[rows,]))))
  }

  if (!is.null(origins)) {
    stopifnot(ncol(origins) == 2)
    result <- c(result, list(origins = as.numeric(t(origins[rows,]))))
  }

  if (!is.null(texcoords)) {
    stopifnot(ncol(texcoords) == 2)
    result <- c(result, list(texcoords = as.numeric(t(texcoords[rows,]))))
  }

  if (!is.null(x))
    result <- c(result, list(x = x[rows]))

  if (!is.null(y))
    result <- c(result, list(y = y[rows]))

  if (!is.null(z))
    result <- c(result, list(z = z[rows]))

  if (!is.null(red))
    result <- c(result, list(red = red[rows]))

  if (!is.null(green))
    result <- c(result, list(green = green[rows]))

  if (!is.null(blue))
    result <- c(result, list(blue = blue[rows]))

  result
}

vertexControl <- function(values = NULL, vertices = 1, attributes, objid,
                          param = seq_len(NROW(values)), interp = TRUE) {
  attributes <- match.arg(attributes,
                          choices = c("x", "y", "z",
                                      "red", "green", "blue", "alpha",
                                      "radii",
                                      "nx", "ny", "nz",
                                      "ox", "oy", "oz",
                                      "ts", "tt"),
                          several.ok = TRUE)
  if (!is.null(values)) {
    ncol <- max(length(vertices), length(attributes))
    if (is.matrix(values))
      stopifnot(ncol == ncol(values))
    else {
      stopifnot(ncol == 1)
      values <- matrix(values, ncol = 1)
    }
    # Repeat first and last values to make search simpler.
    param <- c(-Inf, param, Inf)
    values <- rbind(values[1,], values, values[nrow(values),])
  }

  list(type = "vertexSetter",
       values = values,
       vertices = vertices - 1, # Javascript 0-based indexing
       attributes = attributes,
       objid = as.integer(objid),
       param = param - 1,       # Javascript 0-based indexing
       interp = interp)
}

# This is a bridge to the old system

elementId2Prefix <- function(elementId, prefix = elementId) {
  cat(paste0("<script>var ", prefix, "rgl = {};</script>"))
  rglcontroller(elementId, list(type = "oldBridge", prefix = prefix))
}
