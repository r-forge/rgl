##
## R source file
## This file is part of rgl
##
## $Id: zzz.R,v 1.8.2.1 2004/08/05 14:31:29 murdoch Exp $
##

##
## ===[ SECTION: package entry/exit point ]===================================
##

##
## entry-point
##
##

.First.lib <- function(lib, pkg)
{
  # OS-specific 
  
  if ( .Platform$OS.type == "unix" ) {
    unixos <- system("uname",intern=TRUE)
    if ( unixos == "Darwin" ) {
      # For MacOS X we have to remove /usr/X11R6/lib from the DYLD_LIBRARY_PATH
      # because it would override Apple's OpenGL framework
      Sys.putenv("DYLD_LIBRARY_PATH"=gsub("/usr/X11R6/lib","",Sys.getenv("DYLD_LIBRARY_PATH")))      
    }
  }
	
  # load shared library
  
  library.dynam( "rgl", pkg, lib)
  
  # for the comboBox widget 
  require(tcltk)
  extra <- system.file("exec", package = "rgl")
  if(.Platform$OS.type == "windows")
		extra <- gsub("\\\\", "/", extra)
  addTclPath(extra)
		
  ret <- .C( symbol.C("rgl_init"), 
    success=FALSE , 
    PACKAGE="rgl"
  )
  
  if (!ret$success) {
    stop("error rgl_init")
  }
  
}


##
## exit-point
##
##

.Last.lib <- function(libpath)
{ 
  # shutdown
  
  ret <- .C( symbol.C("rgl_quit"), success=FALSE, PACKAGE="rgl" )
  
  # unload shared library

  library.dynam.unload("rgl",libpath=system.file(package="rgl"))
}

