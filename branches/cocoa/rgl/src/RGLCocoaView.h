// #include "gui.hpp"
#ifdef __OBJC__

#import <Cocoa/Cocoa.h>
#import <OpenGL/gl.h>
#import <OpenGL/glext.h>
#import <OpenGL/glu.h>

namespace gui {
class CocoaWindowImpl;
}

// TODO: protected with, #if MAC_OS_X_VERSION_MIN_REQUIRED >= 1060
@interface RGLCocoaView : NSOpenGLView <NSWindowDelegate>
{
  gui::CocoaWindowImpl* mWindowImpl;
  int mButtonDown; /* button id of down-event */
}

+ (NSOpenGLPixelFormat*) basicPixelFormat;
- (id)   initWithFrame: (NSRect) frameRect andWindowImpl: (gui::CocoaWindowImpl*) impl;
- (void) drawRect:      (NSRect) rect;
/* OpenGL event */
- (void) reshape;
/* UI event */

- (void) mouseDown:  (NSEvent *) theEvent;
- (void) mouseUp:    (NSEvent *) theEvent;
- (void) mouseDragged: (NSEvent *) theEvent;
- (void) rightMouseDown: (NSEvent *) theEvent;
- (void) rightMouseDragged: (NSEvent *) theEvent;
- (void) rightMouseUp: (NSEvent *) theEvent;
- (void) otherMouseDown: (NSEvent *) theEvent;
- (void) otherMouseDragged: (NSEvent *) theEvent;
- (void) otherMouseUp: (NSEvent *) theEvent;

- (void) scrollWheel: (NSEvent *) theEvent;

- (void) rotateWithEvent: (NSEvent *) theEvent;
- (void) magnifyWithEvent: (NSEvent *) theEvent;
- (void) swipeWithEvent: (NSEvent *) theEvent;

// - (void) mouseMoved: (NSEvent *) theEvent;
@end

#endif

