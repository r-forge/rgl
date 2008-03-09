\name{texts}
\alias{rgl.texts}
\alias{text3d}
\alias{texts3d}
\alias{rglFonts}
\title{add text}
\description{
  Adds text to the scene. The text is positioned in 3D space. 
  A bitmap font which is always oriented towards the camera is used.
}
\usage{
rgl.texts(x, y = NULL, z = NULL, text, adj = 0.5, justify, family = par3d("family"), font = par3d("font"), 
            cex = par3d("cex"), useFreeType=par3d("useFreeType"), ...)
text3d(x, y = NULL, z = NULL, texts, adj = 0.5, justify, ...) 
texts3d(x, y = NULL, z = NULL, texts, adj = 0.5, justify, ...) 
rglFonts(...)
}
\arguments{
  \item{x, y, z}{point coordinates.  Any reasonable way of defining the
    coordinates is acceptable.  See the function \code{\link[grDevices]{xyz.coords}}
    for details.}
  \item{text}{text character vector to draw}
  \item{texts}{text character vector to draw}
  \item{adj}{ one value specifying the horizontal adjustment }.
  \item{justify}{(deprecated, please use adj instead) character string
specifying the horizontal adjustment; options are \code{"left"}, \code{"right"},
    \code{"center"}.
  }
  \item{ family }{A device-independent font family name, or "" }
  \item{ font }{A numeric font number from 1 to 5 }
  \item{ cex }{A numeric character expansion value }
  \item{ useFreeType }{logical.  Should FreeType be used to draw text? (See details below.)}
  \item{ ... }{In \code{rgl.texts}, material properties; see \code{\link{rgl.material}} for details.
                 In \code{rglFonts}, device dependent font definitions for use with FreeType.
                 In the other functions, additional parameters to pass to \code{rgl.texts}.}  
}
\details{
The \code{adj} parameter determines the position of the text relative to the 
specified coordinate.  Use \code{adj = 0} to place the left bottom corner at
\code{(x,y,z)}, \code{adj = 0.5} to center the text there, and \code{adj = 1}
to put the right bottom corner there.

\code{text3d} and \code{texts3d} draw text using the \link{r3d}
conventions. These are synonyms; the former is singular to be
consistent with the classic 2-D graphics functions, and the latter is
plural to be consistent with all the other graphics primitives.  Take
your choice!

If any coordinate or text is \code{NA}, that text is not plotted.

The \code{family} specification is the same as for standard graphics, i.e.
families \code{c("serif", "sans", "mono", "symbol")} are normally
available, but users may add additional families.  \code{font} numbers
are restricted to the range 1 to 4 for standard, bold, italic and bold italic
respectively; with font 5 recoded as family \code{"symbol"} font 1.  

Using an unrecognized value for \code{"family"} will result in
the system standard font as used in rgl up to version 0.76.  That font
is not resizable and \code{font} values are ignored.

If \code{useFreeType} is \code{TRUE}, then rgl will use the FreeType
anti-aliased fonts for drawing.  This is generally desirable, so it is the
default on platforms that support FreeType.

}
\value{
  The object ID of the text object is returned invisibly.
}
\examples{
open3d()
famnum <- rep(1:4, 8)
family <- c("serif", "sans", "mono", "symbol")[famnum]
font <- rep(rep(1:4, each=4), 2)
cex <- rep(1:2, each=16)
text3d(font, cex, famnum, text=paste(family, font),adj = 0.5, 
       color="blue", family=family, font=font, cex=cex)
}
\seealso{
  \code{\link{r3d}}
}
\keyword{dynamic}
