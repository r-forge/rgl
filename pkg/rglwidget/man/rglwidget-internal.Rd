\name{rglwidget-internal}
\alias{.ageSetter}
\alias{.par3dinterpSetter}
\alias{.propertySetter}
\alias{.vertexSetter}
\alias{.propertySlider}
\alias{.setupKnitr}
\alias{.writeWebGL}
\alias{.hook_rgl}
\alias{.hook_webgl}
\title{
rglwidget internals
}
\description{
These functions are planned to implement \pkg{rgl} functions, they
are not meant to be called directly by the user.
}
\usage{
.ageSetter(births, ages, colors = NULL, alpha = NULL, radii = NULL,
           vertices = NULL, normals = NULL, origins = NULL,
           texcoords = NULL, objids, prefixes = "", digits = 7,
           param = seq(floor(min(births)), ceiling(max(births))))

.par3dinterpSetter(fn, from, to, steps, subscene = f0$subscene,
           omitConstant = TRUE, rename = character(), ...)

.propertySetter(values = NULL, entries, properties, objids,
                prefixes = "", param = seq_len(NROW(values)),
                interp = TRUE, digits = 7)

.vertexSetter(values = NULL, vertices = 1, attributes, objid,
              prefix = "", param = seq_len(NROW(values)),
              interp = TRUE, digits = 7)

.propertySlider(setter = .propertySetter,
                minS = min(param), maxS = max(param),
                step = 1, init = minS, labels = displayVals(sliderVals),
                id = basename(tempfile("input")), name = id,
                outputid = paste0(id, "text"), index = NULL, ...)

.setupKnitr()

.hook_rgl(before, options, envir)

.hook_webgl(before, options, envir)

.writeWebGL(dir = "webGL", filename = file.path(dir, "index.html"),
           template = system.file(file.path("WebGL", "template.html"), package = "rgl"),
           prefix = "", snapshot = TRUE, commonParts = TRUE,
           reuse = NULL, font = "Arial", width = 512, height = 512)
}
\arguments{
  \item{births, ages, colors, alpha, radii, vertices, normals, origins,
        texcoords, objids, prefixes, digits, param, ceiling,
        fn, from, to, steps, subscene, omitConstant, rename, ...,
        values, entries, properties, interp,
        attributes, objid, prefix, setter, minS, maxS, step,
        init, labels, id, name, outputid, index,
        dir, filename, template, snapshot, commonParts, reuse,
        font, width, height}{
See the corresponding \pkg{rgl} function (i.e. leave off the \dQuote{.}
prefix) for a description of the arguments.
}
}
\author{
Duncan Murdoch
}
\seealso{
\code{\link{ageSetter}}, \code{\link{par3dinterpSetter}},
\code{\link{propertySetter}}, \code{\link{vertexSetter}}
}
