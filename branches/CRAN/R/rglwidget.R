# Shiny objects if the widget sets elementId, so we
# need to detect it.  Thanks to Joe Cheng for suggesting this code.
inShiny <- function() !is.null(getDefaultReactiveDomain())

rmarkdownOutput <- function() {
  if (requireNamespace("rmarkdown")) {
    output <- rmarkdown::metadata$output
    if (length(output))
      if (is.character(output)) return(output[1])
      else if (is.list(output) && length(names(output))) return(names(output)[1]) 
  }
  NULL
}

rglShared <- function(id, key = NULL, group = NULL,
		      deselectedFade = 0.1, 
		      deselectedColor = NULL,
		      selectedColor = NULL,
		      selectedIgnoreNone = TRUE,
		      filteredFade = 0,
		      filteredColor = NULL) {
  data <- as.data.frame(rgl.attrib(id, "vertices"))
  attr(data, "rglId") <- as.integer(id)
  attr(data, "rglOptions") <- list(deselectedFade = deselectedFade,
  				   deselectedColor = if (!is.null(deselectedColor)) as.numeric(col2rgb(deselectedColor, alpha = TRUE)/255),
  				   selectedColor =   if (!is.null(selectedColor)) as.numeric(col2rgb(selectedColor, alpha = TRUE)/255), 
  				   selectedIgnoreNone = selectedIgnoreNone,
  				   filteredFade = filteredFade,
  				   filteredColor =   if (!is.null(filteredColor)) as.numeric(col2rgb(filteredColor, alpha = TRUE)/255))
  n <- nrow(data)
  if (!n)
    stop("No vertices in object ", id)
  if (!is.null(key) && (n != length(key) || anyDuplicated(key)))
    stop("'key' must have exactly one unique value for each vertex")
  result <- if (is.null(group))
    SharedData$new(data, key)
  else
    SharedData$new(data, key, group)
  structure(result, class = c("rglShared", class(result)))
}

CSStoPixels <- function(x, DPI = 100) {
  if (is.null(x))
    return(x)
  num <- function(x)
    as.numeric(sub("[^[:digit:].]*$", "", x))
  units <- function(x)
    sub("^[[:digit:].]+", "", x)
  if (!is.numeric(x)) {
    units <- units(x)
    if (units == "auto")
      stop("Only fixed CSS sizes allowed")
    val <- num(x)
    if (units != "")
      val <- switch(units,
          "px" = val,
          "in" = val * DPI,
          "cm" = val * DPI / 2.54,
          "mm" = val * DPI / 254,
          "pt" = val * DPI / 72,
          "pc" = val * DPI / 6,
          stop("Only fixed CSS sizes allowed")
        )
  } else
    val <- x
  val
}

# These sizes are taken from htmlwidgets/R/sizing.R
DEFAULT_WIDTH <- 960
DEFAULT_HEIGHT <- 500
DEFAULT_PADDING <- 40
DEFAULT_WIDTH_VIEWER <- 450
DEFAULT_HEIGHT_VIEWER <- 350
DEFAULT_PADDING_VIEWER <- 15

# For widgets, we use the sizingPolicy to see how it would be
# displayed
resolveHeight <- function(x, inViewer = TRUE, default = 40) {
  if (inViewer)
    refsize <- DEFAULT_HEIGHT_VIEWER
  else
    refsize <- DEFAULT_HEIGHT
  result <- x$height
  if (is.null(result) && !is.null(policy <- x$sizingPolicy)) { 
    if (inViewer) {
      viewer <- policy$viewer
      if (isTRUE(viewer$fill))
        result <- refsize
      else 
        result <- viewer$defaultHeight
    } else
      result <- NULL
    if (is.null(result) && isTRUE(policy$fill))
      result <- refsize
    if (is.null(result))
      result <- policy$defaultHeight
    if (is.null(result))
      result <- refsize
  }
  if (is.null(result))
    result <- default 

  CSStoPixels(result, refsize)  
}

getWidgetId <- function(widget) {
  if (inherits(widget, "htmlwidget"))
    widget$elementId
  else
    stop("object is not an html widget")
}

# Get information from previous objects being piped into 
# this one, and modify a copy of them as necessary

getHeights <- function(objects, defaultHeight = 40) {
  if (inherits(objects, "combineWidgets"))
    heights <- objects$params$rowsize
  else {
    if (inherits(objects, c("shiny.tag", "htmlwidget")) || 
        !is.list(objects))
      objects <- tagList(objects)
    heights <- rep(defaultHeight, length(objects))
    for (i in seq_along(objects)) {
      tag <- objects[[i]]
      if (inherits(tag, "rglWebGL") && is.null(tag$height))
        heights[i] <- tag$x$height
      else if (inherits(tag, "htmlwidget"))
        heights[i] <- resolveHeight(tag)
      else if (is.list(tag) && 
               !is.null(tag$height) && 
               !is.na(height <- suppressWarnings(as.numeric(tag$height))))
        heights[i] <- height
    }
  }
  heights
}

processUpstream <- function(upstream, elementId = NULL, playerId = NULL) {
  rowsizes <- getHeights(upstream)
  
  prevRglWidget <- NULL
  players <- character()
  
  if (inherits(upstream, "combineWidgets")) 
    upstream <- upstream$widgets

  if (inherits(upstream, c("shiny.tag", "htmlwidget")))
    upstream <- tagList(upstream)
        
  if (is.list(upstream)) {
    # Objects upstream of the current one may need to know about an rgl widget,
    # or this object may need to know about an upstream rgl widget.  Stop when
    # you find one.
    lookForRglWidget <- function(upstream) {
      prevRglWidget <- NULL
      players <- character()
      for (i in rev(seq_along(upstream))) {
        tag <- upstream[[i]]
        if (inherits(tag, "rglWebGL")) {
          prevRglWidget <- tag$elementId
          if (!is.null(playerId) && !(playerId %in% tag$x$players))
            upstream[[i]]$x$players <- c(tag$x$players, playerId)
        } else if (inherits(tag, "rglPlayer") && is.null(tag$x$sceneId)) {
          players <- c(players, tag$elementId)
          if (!is.null(elementId))
            upstream[[i]]$x$sceneId <- elementId
        } else if (inherits(tag, "shiny.tag") && !tagHasAttribute(tag, "rglSceneId")) {
          upstream[[i]] <- tagAppendAttributes(tag, rglSceneId = elementId)
        } else if (inherits(tag, "combineWidgets")) {
          temp <- lookForRglWidget(tag$widgets)
          players <- c(players, temp$players)
          prevRglWidget <- temp$prevRglWidget
          upstream[[i]]$widgets <- temp$objects
        }
        if (!is.null(prevRglWidget))
          break
      }
      list(objects = upstream,
           players = players,
           prevRglWidget = prevRglWidget)
    }
    result <- lookForRglWidget(upstream)
    result$rowsizes <- rowsizes
  } else
    result <- list(objects = upstream,
                   players = if (is.character(upstream)) upstream else character(),
                   prevRglWidget = if (is.character(upstream)) upstream,
                   rowsizes = rowsizes)
        
  result     
}

asRow <- function(..., last = NA, height = NULL, colsize = 1) {
  args <- list(...)
  if (length(args) == 1 
      && inherits(args[[1]], "combineWidgets")) {
    orig <- args[[1]]
  } else {
    orig <- do.call(combineWidgets, c(args, list(ncol = 1, rowsize = getHeights(args))))
  }
  origlen <- length(orig$widgets)
  if (is.na(last))
    last <- origlen
  else if (last > origlen)
    stop("'last' must be no more than the number of widgets")
  keep <- seq_len(origlen - last)
  inrow <- seq_len(last) + origlen - last
  origRowsizes <- rep_len(orig$params$rowsize, origlen)
  if (length(inrow)) {
    maxinrow <- max(origRowsizes[inrow])
    if (is.null(height))
      height <- maxinrow
  } else if (is.null(height))
    height <- 0
  
  orig$params$rowsize <- c(origRowsizes[keep], height)

  row <- do.call(combineWidgets, c(orig$widgets[inrow], list(nrow = 1, 
                                                             colsize = colsize)))
  orig$widgets <- c(orig$widgets[keep], list(row))
  orig
}

rglwidget <- local({
  reuseDF <- NULL

  function(x = scene3d(), width = figWidth(), height = figHeight(),
           controllers = NULL, snapshot = FALSE,
           elementId = NULL,
           reuse = !interactive(),
           webGLoptions = list(preserveDrawingBuffer = TRUE), 
  	   shared = NULL, ...) {
  force(shared) # It might plot something...
  	
  if (is.na(reuse))
    reuseDF <- NULL # local change only
  else if (!reuse)
    reuseDF <<- NULL

  if (is.null(elementId) && !inShiny())
    elementId <- paste0("rgl", sample(100000, 1))

  if (!inherits(x, "rglscene"))
    stop("First argument should be an rgl scene.")
  
  if (!is.list(shared))
    shared <- list(shared)
  if (length(shared)) {
    x$crosstalk <- list(key = vector("list", length(shared)),
    		        group = character(length(shared)),
    		        id = integer(length(shared)),
    		        options = vector("list", length(shared)))
    dependencies <- crosstalkLibs()
  } else {
    x$crosstalk <- list(key = list(), 
    		        group = character(),
    		        id = integer(),
    		        options = list())
    dependencies <- NULL    
  }
  	
  for (i in seq_along(shared)) {
    s <- shared[[i]]
    if (is.SharedData(s) && inherits(s, "rglShared")) {
      x$crosstalk$key[[i]] <- s$key()
      x$crosstalk$group[i] <- s$groupName()
      x$crosstalk$id[i] <- attr(s$origData(), "rglId")
      x$crosstalk$options[[i]] <- attr(s$origData(), "rglOptions")
    } else if (!is.null(s))
      stop("'shared' must be an object produced by rglShared() or a list of these")
  }
  if (!is.null(width))
    width <- CSStoPixels(width)
  if (!is.null(height))
    height <- CSStoPixels(height)
  x = convertScene(x, width, height, snapshot = snapshot,
                   elementId = elementId, reuse = reuseDF)
  if (!is.na(reuse))
    reuseDF <<- attr(x, "reuse")
  
  upstream <- processUpstream(controllers, elementId = elementId)
  x$players <- upstream$players

  x$webGLoptions <- webGLoptions

  # create widget
  attr(x, "TOJSON_ARGS") <- list(na = "string")
  result <- structure(htmlwidgets::createWidget(
    name = 'rglWebGL',
    x = x,
    width = width,
    height = height,
    package = 'rgl',
    elementId = elementId,
    dependencies = dependencies,
    ...
  ), rglReuse = attr(x, "reuse"))
  
  if (is.list(upstream$objects)) {
    do.call(combineWidgets, c(upstream$objects, 
                              list(result, 
                                   rowsize = c(upstream$rowsizes, x$height), 
                                   ncol = 1)))
  } else
    result
}})

#' Widget output function for use in Shiny
#'
#' @export
rglwidgetOutput <- function(outputId, width = '512px', height = '512px'){
  shinyWidgetOutput(outputId, 'rglWebGL', width, height, package = 'rgl')
}

#' Widget render function for use in Shiny
#'
#' @export
renderRglwidget <- function(expr, env = parent.frame(), quoted = FALSE, outputArgs = list()) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  markRenderFunction(rglwidgetOutput,
                     shinyRenderWidget(expr, rglwidgetOutput, env, quoted = TRUE),
  		     outputArgs = outputArgs)
}

shinySetPar3d <- function(..., session,
                          subscene = currentSubscene3d(rgl.cur())) {
  if (!requireNamespace("shiny"))
    stop("function requires shiny")
  args <- list(...)
  argnames <- names(args)
  badargs <- argnames[!(argnames %in% .Par3d) | argnames %in% .Par3d.readonly]
  if (length(badargs))
    stop("Invalid parameter(s): ", badargs)
  for (arg in argnames) {
    session$sendCustomMessage("shinySetPar3d", 
                              list(subscene = subscene,
                                   parameter = arg,
                                   value = args[[arg]]))
  }
}

shinyGetPar3d <- function(parameters, session,
                          subscene = currentSubscene3d(rgl.cur()),
                          tag = "") {
  badargs <- parameters[!(parameters %in% .Par3d)]
  if (length(badargs))
    stop("invalid parameter(s): ", badargs)
  session$sendCustomMessage("shinyGetPar3d",
                              list(tag = tag, subscene = subscene, 
                                   parameters = parameters))
}

convertShinyPar3d <- function(par3d, ...) {
  if (!is.null(par3d$userMatrix))
    par3d$userMatrix <- matrix(unlist(par3d$userMatrix), 4,4)
  par3d
}