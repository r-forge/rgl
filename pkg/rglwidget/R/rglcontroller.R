rglcontroller <- function(sceneId, ..., elementId = NULL, respondTo = NULL) {

  # create widget
  controls = list(...)

  if (is.null(elementId) && !inShiny())
    elementId <- paste0("rgl", sample(100000, 1))

  htmlwidgets::createWidget(
    name = 'rglcontroller',
    x = list(sceneId = sceneId, respondTo = respondTo, controls=controls),
    width = 0,
    height = 0,
    elementId = elementId,
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

playControl <- function(..., start = 0, stop = Inf, interval = 0.05,  rate = 1,
                        components = c("Reverse", "Play", "Slower", "Faster", "Reset", "Slider", "Label"),
                        loop = TRUE,
                        step = 1, labels = seq(from = start, to = stop, by = step),
                        precision = 3, width = "auto") {
  if (!is.finite(stop)) stop <- NULL
  actions <- list(...)
  components <- match.arg(components, several.ok = TRUE)
  if (!is.finite(stop)) {
    warning("Cannot have slider with non-finite values")
    components <- setdiff(components, "Slider")
    labels <- NULL
  }
  list(type = "player",
       actions = actions,
       start = start,
       stop = stop,
       interval = interval,
       rate = rate,
       components = components,
       loop = loop,
       step = step,
       labels = labels,
       precision = precision,
       width = width)
}

# This is a bridge to the old system
# In the old system, the rglClass object was a global named
# <prefix>rgl, and controls install methods on it.  In the
# new system, the rglClass object is just a field of a <div>
# element.  The R code below creates an empty global for the
# controls to modify, then the Javascript code in oldBridge
# imports those into the real scene object.

elementId2Prefix <- function(elementId, prefix = elementId) {
  cat(paste0("<script>var ", prefix, "rgl = {};</script>"))
  rglcontroller(elementId, list(type = "oldBridge", prefix = prefix))
}

# This puts together a custom message for a more extensive change

sceneChange <- function(elementId, x = scene3d(),
                        delete = NULL, add = NULL, replace = NULL,
                        material = FALSE, rootSubscene = FALSE,
                        delfromSubscenes = NULL, skipRedraw = FALSE) {
  allSubscenes <- function() {
    result <- numeric()
    for (obj in scene$objects)
      if (obj$type == "subscene")
        result <- c(result, obj$id)
    result
  }
  inSubscenes <- function(id, subs) {
    result <- numeric()
    for (sub in subs)
      if (id %in% sub$objects)
        result <- c(result, sub$id)
    result
  }
  delete <- unique(c(delete, replace))
  add <- unique(c(add, replace))

  scene <- convertScene(x)
  allsubids <- allSubscenes()
  allsubs <- scene$objects[as.character(allsubids)]
  for (id in add)
    scene$objects[[as.character(id)]]$inSubscenes <- inSubscenes(id, allsubs)

  scene$elementId <- elementId
  allIds <- names(scene$objects)
  dontSend <- setdiff(allIds, as.character(add))
  scene$objects[dontSend] <- NULL
  if (!length(scene$objects))
    scene$objects <- NULL
  scene$sphereVerts <- NULL
  if (!material)
    scene$material <- NULL
  if (!rootSubscene)
    scene$rootSubscene <- NULL
  scene$delete <- delete
  if (is.null(delfromSubscenes))
    delfromSubscenes <- allsubids
  scene$delfromSubscenes <- as.numeric(delfromSubscenes)
  if (is.na(skipRedraw))
    scene$redrawScene <- FALSE
  else {
    scene$redrawScene <- !skipRedraw
    scene$skipRedraw <- skipRedraw
  }
  scene
}

registerSceneChange <- function() {
  tags$script('
Shiny.addCustomMessageHandler("sceneChange",
  rglwidgetClass.prototype.sceneChangeHandler);
')
}
