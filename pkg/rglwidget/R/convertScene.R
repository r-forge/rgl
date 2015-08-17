subst <- function(strings, ..., digits=7) {
  substitutions <- list(...)
  names <- names(substitutions)
  if (is.null(names)) names <- rep("", length(substitutions))
  for (i in seq_along(names)) {
    if ((n <- names[i]) == "")
      n <- as.character(sys.call()[[i+2]])
    value <- substitutions[[i]]
    if (is.numeric(value))
      value <- formatC(value, digits=digits, width=1)
    strings <- gsub(paste("%", n, "%", sep=""), value, strings)
  }
  strings
}

addDP <- function(value, digits=7) {
  if (is.numeric(value)) {
    value <- formatC(value, digits=digits, width=1)
    noDP <- !grepl("[.]", value)
    value[noDP] <- paste(value[noDP], ".", sep="")
  }
  value
}

convertBBox <- function(id) {
	verts <- rgl.attrib(id, "vertices")
	text <- rgl.attrib(id, "text")
	if (!length(text))
		text <- rep("", NROW(verts))
	mat <- rgl:::rgl.getmaterial(id = id)
	if (length(mat$color) > 1)
		mat$color <- mat$color[2] # We ignore the "box" colour

	if(any(missing <- text == ""))
		text[missing] <- apply(verts[missing,], 1, function(row) format(row[!is.na(row)]))

	res <- integer(0)
	if (any(inds <- is.na(verts[,2]) & is.na(verts[,3])))
		res <- c(res, do.call(axis3d, c(list(edge = "x", at = verts[inds, 1], labels = text[inds]), mat)))
	if (any(inds <- is.na(verts[,1]) & is.na(verts[,3])))
		res <- c(res, do.call(axis3d, c(list(edge = "y", at = verts[inds, 2], labels = text[inds]), mat)))
	if (any(inds <- is.na(verts[,1]) & is.na(verts[,2])))
		res <- c(res, do.call(axis3d, c(list(edge = "z", at = verts[inds, 3], labels = text[inds]), mat)))
	res <- c(res, do.call(box3d, mat))
	res
}

convertBBoxes <- function (id) {
	result <- NULL
	if (NROW(bboxes <- rgl.ids(type = "bboxdeco", subscene = id))) {
		save <- currentSubscene3d()
		on.exit(useSubscene3d(save))
		useSubscene3d(id)
		for (i in bboxes$id)
			result <- c(result, convertBBox(i))
	}
	children <- subsceneInfo(id)$children
	for (i in children)
		result <- c(result, convertBBoxes(i))
	result
}

rootSubscene <- function() {
	id <- currentSubscene3d()
	repeat {
		info <- subsceneInfo(id)
		if (is.null(info$parent)) return(id)
		else id <- info$parent
	}
}

# This gets all the clipping planes in a particular subscene
getClipplanes <- function(subscene) {
	shapes <- rgl.ids(subscene=subscene)
	shapes$id[shapes$type == "clipplanes"]
}

# This counts how many clipping planes might affect a particular object
countClipplanes <- function(id, minValue = getOption("rgl.minClipplanes", 0)) {
	recurse <- function(subscene) {
		result <- 0
		subids <- rgl.ids(c("shapes", "bboxdeco"), subscene=subscene)
		ids <- subids$id
		for (spriteid in ids[subids$type == "sprites"]) {
			ids <- c(ids, rgl.attrib(spriteid, "ids"))
		}
		if (id %in% ids) {
			clipids <- getClipplanes(subscene)
			for (clipid in clipids)
				result <- result + rgl.attrib.count(clipid, "offsets")
		}
		subscenes <- rgl.ids("subscene", subscene=subscene)$id
		for (sub in subscenes) {
			if (result >= bound)
				break
			result <- max(result, recurse(sub))
		}
		result
	}
	bound <- length(getClipplanes(0))
	if (bound < minValue) return(minValue)
	max(minValue, recurse(rootSubscene()))
}

convertScene <- function(width = NULL, height = NULL, reuse = NULL) {

	# Lots of utility functions and constants defined first; execution starts way down there...

  veclen <- function(v) sqrt(sum(v^2))

  normalize <- function(v) v/veclen(v)

  vec2vec3 <- function(vec) {
    vec <- addDP(vec)
    sprintf("vec3(%s, %s, %s)", vec[1], vec[2], vec[3])
  }

	col2rgba <- function(col) as.numeric(col2rgb(col, alpha=TRUE))/255

	col2vec3 <- function(col) vec2vec3(col2rgba(col))

	vec2vec4 <- function(vec) {
		vec <- addDP(vec)
		sprintf("vec4(%s, %s, %s, %s)", vec[1], vec[2], vec[3], vec[4])
	}

	shaders <- function(id, type, flags) {
		if (type == "clipplanes" || flags["reuse"]) return(NULL)
		mat <- rgl:::rgl.getmaterial(id=id)
		is_lit <- flags["is_lit"]
		is_smooth <- flags["is_smooth"]
		has_texture <- flags["has_texture"]
		fixed_quads <- flags["fixed_quads"]
		sprites_3d <- flags["sprites_3d"]
		sprite_3d <- flags["sprite_3d"]
		clipplanes <- countClipplanes(id)

		if (has_texture)
			texture_format <- mat$textype

		if (is_lit) {
			lights <- rgl.ids("lights")
			if (is.na(lights$id[1])) {
				# no lights
				is_lit <- FALSE
			}
			else {
				lAmbient <- list()
				lDiffuse <- list()
				lSpecular <- list()
				lightxyz <- list()
				lighttype <- matrix(NA, length(lights$id), 2)
				colnames(lighttype) <- c("viewpoint", "finite")
				for (i in seq_along(lights$id)) {
					lightid <- lights$id[[i]]
					lightcols <- rgl.attrib(lightid, "colors")
					lAmbient[[i]] <- lightcols[1,]
					lDiffuse[[i]] <- lightcols[2,]
					lSpecular[[i]] <- lightcols[3,]
					lightxyz[[i]] <- rgl.attrib(lightid, "vertices")
					lighttype[i,] <- t(rgl.attrib(lightid, "flags"))
				}
			}
		}
		if (sprites_3d)
			return(NULL)
		vertex <- c(subst(
			'	/* ****** %type% object %id% vertex shader ****** */',
			type, id),

			'	attribute vec3 aPos;
			attribute vec4 aCol;
			uniform mat4 mvMatrix;
			uniform mat4 prMatrix;
			varying vec4 vCol;
			varying vec4 vPosition;',

			if (is_lit && !fixed_quads)
				'	attribute vec3 aNorm;
			uniform mat4 normMatrix;
			varying vec3 vNormal;',

			if (has_texture || type == "text")
				'	attribute vec2 aTexcoord;
			varying vec2 vTexcoord;',

			if (type == "text")
				'	uniform vec2 textScale;',

			if (fixed_quads)
				'	attribute vec2 aOfs;'
			else if (sprite_3d)
				'	uniform vec3 uOrig;
			uniform float uSize;
			uniform mat4 usermat;',

			'	void main(void) {',

			if (clipplanes || (!fixed_quads && !sprite_3d))
				'	  vPosition = mvMatrix * vec4(aPos, 1.);',

			if (!fixed_quads && !sprite_3d)
				'	  gl_Position = prMatrix * vPosition;',

			if (type == "points") subst(
				'	  gl_PointSize = %size%;', size=addDP(mat$size)),

			'	  vCol = aCol;',

			if (is_lit && !fixed_quads && !sprite_3d)
				'	  vNormal = normalize((normMatrix * vec4(aNorm, 1.)).xyz);',

			if (has_texture || type == "text")
				'	  vTexcoord = aTexcoord;',

			if (type == "text")
				'	  vec4 pos = prMatrix * mvMatrix * vec4(aPos, 1.);
			pos = pos/pos.w;
			gl_Position = pos + vec4(aOfs*textScale, 0.,0.);',

			if (type == "sprites")
				'	  vec4 pos = mvMatrix * vec4(aPos, 1.);
			pos = pos/pos.w + vec4(aOfs, 0., 0.);
			gl_Position = prMatrix*pos;',

			if (sprite_3d)
				'	  vNormal = normalize((vec4(aNorm, 1.)*normMatrix).xyz);
			vec4 pos = mvMatrix * vec4(uOrig, 1.);
			vPosition = pos/pos.w + vec4(uSize*(vec4(aPos, 1.)*usermat).xyz,0.);
			gl_Position = prMatrix * vPosition;',

			'	}')

		# Important:  in some implementations (e.g. ANGLE) declarations that involve computing must be local (inside main()), not global
		fragment <- c(subst(
			'	/* ****** %type% object %id% fragment shader ****** */',
			type, id),

				'	#ifdef GL_ES
				precision highp float;
				#endif
				varying vec4 vCol; // carries alpha
				varying vec4 vPosition;',

			if (has_texture || type == "text")
				'	varying vec2 vTexcoord;
			uniform sampler2D uSampler;',

			if (is_lit && !fixed_quads)
				'	varying vec3 vNormal;',

			if (clipplanes) paste0(
				'	uniform vec4 vClipplane', seq_len(clipplanes), ';'),

			if (is_lit && !all(lighttype[,"viewpoint"]))
				'	uniform mat4 mvMatrix;',

			'	void main(void) {',

			if (clipplanes) paste0(
				'	  if (dot(vPosition, vClipplane', seq_len(clipplanes), ') < 0.0) discard;'),

			if (is_lit)
				'	  vec3 eye = normalize(-vPosition.xyz);',

			# collect lighting information
			if (is_lit) {
				res <- subst(
					'	  const vec3 emission = %emission%;',
					emission = vec2vec3(col2rgba(mat$emission)))

				for (idn in seq_along(lights$id)) {
					finite <- lighttype[idn,"finite"]
					viewpoint <- lighttype[idn, "viewpoint"]
					res <- c(res, subst(
						'	  const vec3 ambient%idn% = %ambient%;
						const vec3 specular%idn% = %specular%;// light*material
						const float shininess%idn% = %shininess%;
						vec4 colDiff%idn% = vec4(vCol.rgb * %diffuse%, vCol.a);',
						ambient = vec2vec3(col2rgba(mat$ambient)*lAmbient[[idn]] + col2rgba(mat$emission)), #FIXME : Materialemission wird bei mehreren Lichtquellen mehrfach genutzt
						specular = vec2vec3(col2rgba(mat$specular)*lSpecular[[idn]]),
						shininess = addDP(mat$shininess),
						diffuse = vec2vec3(lDiffuse[[idn]]),
						idn = idn),

						{
							lightdir <- lightxyz[[idn]]
							if (!finite)
								lightdir <- normalize(lightdir)
							if (viewpoint)
								lightdir <- vec2vec3(lightdir)
							else
								lightdir <- subst('(mvMatrix * %lightdir%).xyz', lightdir=vec2vec4(c(lightdir,1)))
							# directional light
							if (!finite) {
								subst(
									'	  const vec3 lightDir%idn% = %lightdir%;
									vec3 halfVec%idn% = normalize(lightDir%idn% + eye);',
									lightdir = lightdir,
									idn = idn)
							}
							else { # point-light
								subst(
									'	  vec3 lightDir%idn% = normalize(%lightdir% - vPosition.xyz);
									vec3 halfVec%idn% = normalize(lightDir%idn% + eye);',
									lightdir = lightdir,
									idn = idn)
							}
						})
				}
				res
						}
			else {
				'      vec4 colDiff = vCol;'
			},

			if (is_lit) {
				res <- c(
					'      vec4 lighteffect = vec4(emission, 0.);')
				if (fixed_quads) {
					res <- c(res,
						 '	  vec3 n = vec3(0., 0., -1.);')
				}
				else {
					res <- c(res,
						 '	  vec3 n = normalize(vNormal);
						 n = -faceforward(n, n, eye);')
				}
				for (idn in seq_along(lights$id)) {
					res <- c(res, subst(
						'	  vec3 col%idn% = ambient%idn%;
						float nDotL%idn% = dot(n, lightDir%idn%);
						col%idn% = col%idn% + max(nDotL%idn%, 0.) * colDiff%idn%.rgb;
						col%idn% = col%idn% + pow(max(dot(halfVec%idn%, n), 0.), shininess%idn%) * specular%idn%;
						lighteffect = lighteffect + vec4(col%idn%, colDiff%idn%.a);',
						idn = idn))
				}
				res
				}
			else {
				'	  vec4 lighteffect = colDiff;'
			},

			if ((has_texture && texture_format == "rgba") || type == "text")
				'	  vec4 textureColor = lighteffect*texture2D(uSampler, vTexcoord);',

			if (has_texture) switch(texture_format,
						rgb =
							'	  vec4 textureColor = lighteffect*vec4(texture2D(uSampler, vTexcoord).rgb, 1.);',
						alpha =
							'	  vec4 textureColor = texture2D(uSampler, vTexcoord);
						float luminance = dot(vec3(1.,1.,1.), textureColor.rgb)/3.;
						textureColor =  vec4(lighteffect.rgb, lighteffect.a*luminance);',
						luminance =
							'	  vec4 textureColor = vec4(lighteffect.rgb*dot(texture2D(uSampler, vTexcoord).rgb, vec3(1.,1.,1.))/3.,
						lighteffect.a);',
						luminance.alpha =
							'	  vec4 textureColor = texture2D(uSampler, vTexcoord);
						float luminance = dot(vec3(1.,1.,1.),textureColor.rgb)/3.;
						textureColor = vec4(lighteffect.rgb*luminance, lighteffect.a*textureColor.a);'),

			if (has_texture)
			  '	  gl_FragColor = textureColor;'
			else if (type == "text")
			  '	  if (textureColor.a < 0.1)
			discard;
			else
			gl_FragColor = textureColor;'
			else
			  '	  gl_FragColor = lighteffect;',

			'	}'     )
		list(vertex = vertex, fragment = fragment)
	}

	makeList <- function(x) {
	  if (is.list(x)) x <- lapply(x, makeList)
	  if (length(names(x))) x <- as.list(x)
	  x
	}

	initResult <- function() {
    result <- makeList(scene3d())

    recurse <- function(subscene) {
      subscenes <- subscene$subscenes
      for (i in seq_along(subscenes)) {
        subscenes[[i]]$parent <- subscene$id
        subscenes[[i]] <- recurse(subscenes[[i]])
      }
      if (length(subscenes))
        subscene$subscenes <- unlist(subscenes)
      else
        subscene$subscenes <- integer(0)
      id <- as.character(subscene$id)
      result$objects[[id]] <<- subscene
      subscene$id
    }
    result$rootSubscene <- recurse(result$rootSubscene)
		result
	}


	flagnames <- c("is_lit", "is_smooth", "has_texture", "is_indexed",
		       "depth_sort", "fixed_quads", "is_transparent",
		       "is_lines", "sprites_3d", "sprite_3d",
		       "is_subscene", "is_clipplanes", "reuse")

	getFlags <- function(id, type) {

		if (type == "subscene")
			return(getSubsceneFlags(id))

		result <- structure(rep(FALSE, length(flagnames)), names = flagnames)
		if (type == "clipplanes") {
			result["is_clipplanes"] <- TRUE
			return(result)
		}

		if (type %in% c("light", "bboxdeco", "background"))
		  return(result)

		mat <- rgl:::rgl.getmaterial(id=id)
		result["is_lit"] <- mat$lit && type %in% c("triangles", "quads", "surface", "planes",
							   "spheres", "sprites")

		result["is_smooth"] <- mat$smooth && type %in% c("triangles", "quads", "surface", "planes",
								 "spheres")

		result["has_texture"] <- !is.null(mat$texture) && length(rgl.attrib.count(id, "texcoords"))

		result["is_transparent"] <- is_transparent <- any(rgl.attrib(id, "colors")[,"a"] < 1)

		result["depth_sort"] <- depth_sort <- is_transparent && type %in% c("triangles", "quads", "surface",
										    "spheres", "sprites", "text")

		result["sprites_3d"] <- sprites_3d <- type == "sprites" && rgl.attrib.count(id, "ids")

		result["is_indexed"] <- (depth_sort || type %in% c("quads", "surface", "text", "sprites")) && !sprites_3d

		result["fixed_quads"] <- type %in% c("text", "sprites") && !sprites_3d
		result["is_lines"]    <- type %in% c("lines", "linestrip", "abclines")

		result
	}

	getSubsceneFlags <- function(id) {
		result <- structure(rep(FALSE, length(flagnames)), names = flagnames)
		result["is_subscene"] <- TRUE
		subs <- rgl.ids(subscene = id)
		for (i in seq_len(nrow(subs)))
			result <- result | getFlags(subs[i, "id"], as.character(subs[i, "type"]))
		return(result)
	}

	numericFlags <- function(flags) {
		if (is.matrix(flags))
			n <- ncol(flags)
		else
			n <- length(flags)
		unname(flags %*% 2^(seq_len(n)-1))
	}

	expandFlags <- function(numericflags) {
	  result <- matrix(FALSE, nrow = length(numericflags),
	                          ncol = length(flagnames),
	                   dimnames = list(names(numericflags), flagnames))
    for (i in seq_along(flagnames)) {
      result[,i] <- numericflags %% 2 == 1
      numericflags <- numericflags %/% 2
    }
	  result
	}

		knowntypes <- c("points", "linestrip", "lines", "triangles", "quads",
				"surface", "text", "abclines", "planes", "spheres",
				"sprites", "clipplanes", "light", "background", "bboxdeco",
				"subscene")

	#  Execution starts here!

	# Do a few checks first

	if (is.null(reuse) || isTRUE(reuse))
		prefixes <- data.frame(id = integer(), prefix = character(), texture = character(),
				       stringsAsFactors = FALSE)
	else {
		if (!is.data.frame(reuse) || !all(c("id", "prefix", "texture") %in% names(reuse)))
			stop("'reuse' should be a dataframe with columns 'id', 'prefix', 'texture'")
		prefixes <- reuse[,c("id", "prefix", "texture")]
		prefixes$texture <- as.character(prefixes$texture)
	}

	rect <- par3d("windowRect")
	rwidth <- rect[3] - rect[1] + 1
	rheight <- rect[4] - rect[2] + 1
	if (is.null(width)) {
	  if (is.null(height)) {
	    wfactor <- hfactor <- 1  # width = wfactor*rwidth, height = hfactor*rheight
	  } else
	    wfactor <- hfactor <- height/rheight
	} else {
	  if (is.null(height)) {
	    wfactor <- hfactor <- width/rwidth
	  } else {
	    wfactor <- width/rwidth;
	    hfactor <- height/rheight;
	  }
	}
	width <- wfactor*rwidth;
	height <- hfactor*rheight;

	if (NROW(rgl.ids("bboxdeco", subscene = 0))) {
		saveredraw <- par3d(skipRedraw = TRUE)
		temp <- convertBBoxes(rootSubscene())
		on.exit({ rgl.pop(id=temp); par3d(saveredraw) })
	}

	result <- initResult()

	ids <- vapply(result$objects, function(x) x$id, integer(1))
	types <- vapply(result$objects, function(x) x$type, character(1))
  flags <- vapply(result$objects, function(obj) numericFlags(getFlags(obj$id, obj$type)),
                                 numeric(1), USE.NAMES = FALSE)

# 	i <- 0
# 	while (i < length(ids)) {
# 		i <- i + 1
# 		flags[i,] <- getFlags(ids[i], types[i])
# 		if (flags[i, "sprites_3d"]) {
# 			subids <- rgl.attrib(ids[i], "ids")
# 			flags[ids %in% subids, "sprite_3d"] <- TRUE
# 		}
# 	}
# 	flags[ids %in% prefixes$id, "reuse"] <- TRUE

	unknowntypes <- setdiff(types, knowntypes)
	if (length(unknowntypes))
		warning(gettextf("Object type(s) %s not handled",
				 paste("'", unknowntypes, "'", sep="", collapse=", ")), domain = NA)

	keep <- types %in% setdiff(knowntypes, c("light", "background", "bboxdeco"))
	ids <- ids[keep]
	cids <- as.character(ids)
	nflags <- flags[keep]
	types <- types[keep]
	flags <- expandFlags(nflags)

	for (i in seq_along(ids)) {
	  obj <- result$objects[[cids[i]]]
	  obj$flags <- nflags[i]
	  if (obj$type != "subscene") {
	    shade <- shaders(ids[i], types[i], flags[i,])
	    obj$vshader <- paste(shade$vertex, collapse = "\n")
	    obj$fshader <- paste(shade$fragment, collapse = "\n")
	  }
	  result$objects[[cids[i]]] <- obj
	}

	result$scene_has_faces <- any(flags[,"is_lit"] & !flags[,"fixed_quads"])
	result$scene_needs_sorting <- any(flags[,"depth_sort"])

	# Make model sphere
	x <- subdivision3d(octahedron3d(),2)
	r <- sqrt(x$vb[1,]^2 + x$vb[2,]^2 + x$vb[3,]^2)
	x$vb <- x$vb[1:3,]/r
	x$it <- x$it - 1
  result$sphereVerts <- x
	result
}

