.onAttach <- function(libname, pkgname) {
  packageStartupMessage(
  "The 'tkrgl' package functions have been moved to the 'rgl' package.
   Their names have been prefixed with 'tk', i.e. they have been 
   renamed to 'tkpar3dsave', 'tkspin3d', and 'tkspinControl'.  Please
   switch to that package as 'tkrgl' is no longer maintained.")
}