#ifndef RGL_CONFIG_HPP
#define RGL_CONFIG_HPP
// ---------------------------------------------------------------------------
// Platform detection
// ---------------------------------------------------------------------------
#if defined(__APPLE__)
#  ifndef RGL_X11
#    define RGL_COCOA
#  endif
#elif defined(_WIN32) || defined(__WIN32__) || defined(WIN32)
#  define RGL_W32
#else
#  define RGL_X11
#endif
// ---------------------------------------------------------------------------
#endif //RGL_CONFIG_HPP

