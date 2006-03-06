\name{rgl.material}
\alias{rgl.material}
\alias{rgl.getcolorcount}
\alias{rgl.getmaterial}
\alias{material3d}
\title{generic Appearance setup}
\description{
  Set material properties for geometry appearance.
}
\usage{

rgl.material( color, alpha, lit, ambient, specular, emission,
  shininess, smooth, texture, textype, texmipmap, texminfilter,
  texmagfilter, texenvmap, front, back, size, fog )

material3d( color, alpha, lit, ambient, specular, emission,
  shininess, smooth, texture, textype, texmipmap, texminfilter,
  texmagfilter, texenvmap, front, back, size, fog )

rgl.getcolorcount()
rgl.getmaterial(ncolors = rgl.getcolorcount())
}
\arguments{
  \item{color}{
    vector of R color characters, default \code{"white"}. Represents the diffuse component in case of lighting calculation (lit = TRUE),
    otherwise it describes the solid color characteristics.  Alternatively, a list of
    parameters; see Details below.
  }
  \item{lit}{
    logical, default \code{TRUE}, specifying if lighting calculation should take place on geometry
  }
  \item{ambient, specular, emission, shininess}{
    properties for lighting calculation, default \code{"black", "white", "black", 50.0}. 
    ambient, specular, emission are R color character string values; shininess represents a
    numerical.
  }
  \item{alpha}{ 
    vector of alpha values between 0.0 (fully transparent) .. 1.0 (opaque), default 1.0.
  }
  \item{smooth}{
    logical, specifying whether gouraud shading (smooth, the default) or flat shading should be used.
  }
  \item{texture}{ 
    path to a texture image file. Supported formats: png.
  }
  \item{textype}{
    specifies what is defined with the pixmap
    \describe{
      \item{"alpha"}{alpha values}
      \item{"luminance"}{luminance}
      \item{"luminance.alpha"}{luminance and alpha}
      \item{"rgb"}{(default) color}
      \item{"rgba"}{color and alpha texture}
    }
  }
  \item{texmipmap}{
    Logical, specifies if the texture should be mipmapped.
  }
  \item{texmagfilter}{
    specifies the magnification filtering type (sorted by ascending quality):
    \describe{
      \item{"nearest"}{texel nearest to the center of the pixel}
      \item{"linear"}{(default) weighted linear average of a 2x2 array of texels}
    }
  }
  \item{texminfilter}{
    specifies the minification filtering type (sorted by ascending quality):
    \describe{
      \item{"nearest"}{texel nearest to the center of the pixel}
      \item{"linear"}{(default) weighted linear average of a 2x2 array of texels}
      \item{"nearest.mipmap.nearest"}{low quality mipmapping}
      \item{"nearest.mipmap.linear"}{medium quality mipmapping}
      \item{"linear.mipmap.nearest"}{medium quality mipmapping}
      \item{"linear.mipmap.linear"}{high quality mipmapping}
    }
  }
  \item{texenvmap}{
    logical, default \code{FALSE}, specifies if auto-generated texture coordinates for environment-mapping 
    should be performed on geometry.
  }
  \item{front, back}{
    Determines the polygon mode for the specified side:
    \describe{
      \item{"fill"}{(default) filled polygon}
      \item{"line"}{wireframed polygon}
      \item{"points"}{point polygon}
      \item{"cull"}{culled (hidden) polygon}
    }
  }
  \item{size}{ 
    numeric, default 1.0, specifying the line and point size.
  }
  \item{fog}{logical, default \code{TRUE}, specifying if fog effect should be applied on the corresponding shape}
  \item{ncolors}{integer specifying how many colors and alpha values are requested to be returned}
}
\details{
  Only one side at a time can be culled.
  
  \code{material3d} is a synonym for \code{rgl.material}.
  
  If \code{color} (the first) argument is a list, it is treated as a list of parameters in
  a call to \code{rgl.material}.
  
  
}
\value{
  \code{rgl.material} is called for the side effect of setting the current material.
  
  \code{rgl.getcolorcount} returns the number of colors defined in the current material.
  
  \code{rgl.getmaterial} returns a list of parameters defining the current material.
  The current implementation does not return parameters for textures.
}
\seealso{
\code{\link{rgl.primitive}},
\code{\link{rgl.bbox}},
\code{\link{rgl.bg}},
\code{\link{rgl.light}}
}
\keyword{dynamic}



