
##
## bring device to top
##
##

rgl.bringtotop <- function() {

  ret <- .C( symbol.C("rgl_dev_bringtotop"), success=FALSE, PACKAGE="rgl" )

  if (! ret$success)
    stop("failed")

}
