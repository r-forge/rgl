// #include "gui.hpp"
#ifdef __OBJC__

#import <Cocoa/Cocoa.h>
#import <OpenGL/gl.h>
#import <OpenGL/glext.h>
#import <OpenGL/glu.h>

namespace gui {
class CocoaWindowImpl;
}

@interface RGLCocoaView : NSOpenGLView // <NSWindowDelegate>
{
  gui::CocoaWindowImpl* mWindowImpl;
}

+ (NSOpenGLPixelFormat*) basicPixelFormat;
- (id)   initWithFrame: (NSRect) frameRect andWindowImpl: (gui::CocoaWindowImpl*) impl;
- (void) drawRect:      (NSRect) rect;
- (void) reshape;

@end

#endif
