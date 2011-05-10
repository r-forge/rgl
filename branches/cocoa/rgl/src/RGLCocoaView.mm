#include "config.hpp"

#ifdef RGL_COCOA

#include "lib.hpp"
#include "gui.hpp"
#include <sys/time.h>
#include <unistd.h>
#include "RGLCocoaView.h"
#include <iostream>

#define DEBUG_LOG(X) std::cout << "DEBUG_LOG: " << #X << "\n";

namespace gui {

class CocoaWindowImpl : public WindowImpl
{
public:
  CocoaWindowImpl(Window* w) : WindowImpl(w) 
  {
    int init_w = 256, init_h = 256;
    NSRect rect = NSMakeRect(50.0, 50.0, (float) init_w, (float) init_h);
    mRGLCocoaView = [[RGLCocoaView alloc] initWithFrame: rect andWindowImpl: this];
    mNSWindow = [[NSWindow alloc] 
      initWithContentRect: rect 
      styleMask: NSTitledWindowMask 
               | NSClosableWindowMask 
               | NSMiniaturizableWindowMask
               | NSResizableWindowMask 
               // | NSTexturedBackgroundWindowMask
      backing:NSBackingStoreBuffered 
      defer:YES
    ];
    // [mNSWindow setOpaque:NO];
    // [mNSWindow setAcceptsMouseMovedEvents:YES];
    [mNSWindow setDelegate: mRGLCocoaView];
    [mNSWindow setContentView: mRGLCocoaView];
    [mNSWindow setInitialFirstResponder: mRGLCocoaView];
    [mNSWindow makeKeyAndOrderFront: NSApp];
    setSize(init_w,init_h);
  }
  void setSize(int w, int h)
  {
    mHeight = h;
    postResize(w,h);
  }
  virtual void setTitle(const char* title) 
  {
    [mNSWindow setTitle: [NSString stringWithUTF8String: title]]; 
  }
  virtual void setWindowRect(int left, int top, int right, int bottom) 
  { 
    DEBUG_LOG(setWindowRect)
    // frameRectForContentRect: NSMakeRect(left,top,right-left+1,bottom-top+1)
    // [mNSWindow setRect: rect]; 
  }
  virtual void getWindowRect(int *left, int *top, int *right, int *bottom) 
  {
    DEBUG_LOG(getWindowRect)
#if 0
    NSRect r  = [mNSWindow contentRectForFrameRect: [mRGLCocoaView frame] ];
    left [0]  = (int) r.origin.x;
    top  [0]  = (int) r.origin.y;
    right[0]  = (int) left[0] + r.size.width;
    bottom[0] = (int) top[0]  + r.size.height;
#endif
  }
  virtual void show(void) { 
    DEBUG_LOG(show) 
  }
  virtual void hide(void) { 
    DEBUG_LOG(hide) 
  }
  virtual void update(void) { 
    DEBUG_LOG(update)
    [mNSWindow display];
    [[mRGLCocoaView openGLContext]flushBuffer];
    // [mRGLCocoaView setNeedsDisplay: YES];
  }

  virtual void bringToTop(int stay) { 
    DEBUG_LOG(bringToTop)
    [mNSWindow makeKeyAndOrderFront: NSApp];
  }
  /// @doc notifyDestroy will be called on success
  virtual void destroy(void) {
    DEBUG_LOG(destroy)
    [mNSWindow close];
  }
  virtual bool beginGL(void) { 
    // DEBUG_LOG(beginGL)
    [[mRGLCocoaView openGLContext]makeCurrentContext];
    return true; 
  }
  virtual void endGL(void) { 
    // DEBUG_LOG(endGL)
  }
  virtual void swap(void) { 
    //TODO: remove? not called at all?
    DEBUG_LOG(swap)
    [ [mRGLCocoaView openGLContext ] flushBuffer];
  }
  virtual void captureMouse(View* captureView) { 
  }
  virtual void releaseMouse(void) { 
  }
  virtual GLFont* getFont(const char* family, int style, double cex, 
                          bool useFreeType) { return 0; }

  void postPaint() {
    //THIS WAS IMPORTANT:
    if (!window) return;
    window->paint();
  }
  void postReshape() {
    //haven't checked..
    if (!window) return;
    
    NSRect r = [mRGLCocoaView bounds];
    int w = (int) NSWidth(r);
    int h = (int) NSHeight(r);
    std::cout << "size " << w << " x " << h << "\n";
    setSize(w,h);
  }
  inline void postResize       (int w, int h)             { window->resize(w,h); }
  inline void postButtonPress  (int button, int x, int y) { window->buttonPress  (button,x,mHeight-y); }
  inline void postButtonRelease(int button, int x, int y) { window->buttonRelease(button,x,mHeight-y); }
  inline void postMouseMove    (int x, int y)             { window->mouseMove    (x,mHeight-y); }
  inline void postWheelRotate  (int deltaY)               { window->wheelRotate  ( (deltaY>0.0) ? gui::GUI_WheelForward : gui::GUI_WheelBackward ); }
  inline void postCaptureLost  ()                         { window->captureLost();  }
  inline void postKeyPress     (int code)                 { window->keyPress(code); } 
private:
  RGLCocoaView *mRGLCocoaView;
  NSWindow     *mNSWindow;
  int           mHeight;
};

class CocoaGUIFactory : public GUIFactory
{
public:
  virtual WindowImpl* createWindowImpl(Window* window)
  {
    return new CocoaWindowImpl(window);
  }
};

}

namespace lib {
bool init() {
  /* if not running, start cocoa mainloop. */ 
  /* TODO: implement start cocoa mainloop. */
  return true;
}
void quit() {
  /* leave mainloop running. */
}

double getTime() {
  struct ::timeval t;
  gettimeofday(&t,NULL);
  return ( (double) t.tv_sec ) * 1000.0 + ( ( (double) t.tv_usec ) / 1000.0 ); 
}
  
gui::GUIFactory* getGUIFactory()
{
  static gui::CocoaGUIFactory factory;
  return &factory;
}

}

@implementation RGLCocoaView

+ (NSOpenGLPixelFormat*) basicPixelFormat
{
    NSOpenGLPixelFormatAttribute attributes [] = {
        NSOpenGLPFAWindow,
        NSOpenGLPFADoubleBuffer,    // double buffered
        NSOpenGLPFADepthSize, (NSOpenGLPixelFormatAttribute)16, // 16 bit depth buffer
        // NSOpenGLPFNoRecovery,
        // NSOpenGLPFAccelerated,
        NSOpenGLPFAColorSize, 24,
        NSOpenGLPFAAlphaSize, 8,
        // NSOpenGLPFAStencilSize, 8,
        (NSOpenGLPixelFormatAttribute)nil
    };
    return [[[NSOpenGLPixelFormat alloc] initWithAttributes:attributes] autorelease];
}

-(id) initWithFrame: (NSRect) frameRect andWindowImpl: (gui::CocoaWindowImpl*) impl
{
    NSOpenGLPixelFormat * pf = [RGLCocoaView basicPixelFormat];
    self = [super initWithFrame: frameRect pixelFormat: pf];
    self->mWindowImpl = impl;
    return self;
}

- (void) drawRect:(NSRect)rect
{
  DEBUG_LOG(drawRect)
  self->mWindowImpl->postPaint();
  // [ [self openGLContext] flushBuffer ];
}

- (void) reshape
{
  DEBUG_LOG(reshape)
  self->mWindowImpl->postReshape();
  self->mWindowImpl->update();
}

#define DUMP(X) { NSPoint p = [theEvent locationInWindow]; int button = [theEvent buttonNumber]; std::cout << #X << ": button=" << button << " : " << p.x << "," << p.y << "\n"; }

- (void) mouseDown:         (NSEvent *) theEvent {
  NSUInteger f = [NSEvent modifierFlags];
  NSPoint p = [theEvent locationInWindow];
  int x = p.x;
  int y = p.y;
  std::cout << "mouseDown: ";
  self->mButtonDown = gui::GUI_ButtonLeft;
  if (f & NSControlKeyMask)   { self->mButtonDown = gui::GUI_ButtonRight;  std::cout << "CTRL "; }
  if (f & NSShiftKeyMask)     { self->mButtonDown = gui::GUI_ButtonMiddle; std::cout << "Shift "; } 
  if (f & NSAlternateKeyMask) { self->mButtonDown = gui::GUI_ButtonMiddle; std::cout << "Alternate "; }
  std::cout << "pos: " << x << "," << y << "\n";
  mWindowImpl->postButtonPress(self->mButtonDown,x,y);
}
- (void) mouseUp:           (NSEvent *) theEvent {
  NSPoint p = [theEvent locationInWindow];
  int x = p.x;
  int y = p.y;
  std::cout << "mouseUp: ";
  NSUInteger f = [NSEvent modifierFlags];
  if (f & NSControlKeyMask) std::cout << "CTRL ";
  if (f & NSShiftKeyMask) std::cout << "Shift ";
  if (f & NSAlternateKeyMask) std::cout << "Alternate ";
  std::cout << "pos: " << x << "," << y << "\n";
  mWindowImpl->postButtonRelease(self->mButtonDown,x,y);
}
- (void) mouseDragged:      (NSEvent *) theEvent
{
  NSPoint p = [theEvent locationInWindow];
  int x = p.x;
  int y = p.y;
  std::cout << "mouseDragged: " << x << "," << y << "\n";
  mWindowImpl->postMouseMove(x,y);
}
- (void) rightMouseDown:    (NSEvent *) theEvent
{
  NSPoint p = [theEvent locationInWindow];
  int x = p.x;
  int y = p.y;
  self->mButtonDown = gui::GUI_ButtonRight;
  std::cout << "rightMouseDown: " << x << "," << y << "\n";
  mWindowImpl->postButtonPress(self->mButtonDown,x,y);
}
- (void) rightMouseDragged: (NSEvent *) theEvent
{
  NSPoint p = [theEvent locationInWindow];
  int x = p.x;
  int y = p.y;
  std::cout << "rightMouseDragged: " << x << "," << y << "\n";
  mWindowImpl->postMouseMove(x,y);
}
- (void) rightMouseUp:      (NSEvent *) theEvent
{
  NSPoint p = [theEvent locationInWindow];
  int x = p.x;
  int y = p.y;
  std::cout << "rightMouseUp: " << x << "," << y << "\n";
  mWindowImpl->postButtonRelease(self->mButtonDown,x,y);
}
- (void) otherMouseDown:    (NSEvent *) theEvent
{
  NSPoint p = [theEvent locationInWindow];
  int x = p.x;
  int y = p.y;
  self->mButtonDown = gui::GUI_ButtonMiddle;
  std::cout << "otherMouseDown: " << x << "," << y << "\n";
  mWindowImpl->postButtonPress(self->mButtonDown,x,y);
}
- (void) otherMouseDragged: (NSEvent *) theEvent
{
  NSPoint p = [theEvent locationInWindow];
  int x = p.x;
  int y = p.y;
  std::cout << "otherMouseDragged: " << x << "," << y << "\n";
  mWindowImpl->postMouseMove(x,y);
}
- (void) otherMouseUp:      (NSEvent *) theEvent
{
  NSPoint p = [theEvent locationInWindow];
  int x = p.x;
  int y = p.y;
  std::cout << "otherMouseUp: " << x << "," << y << "\n";
  mWindowImpl->postButtonRelease(self->mButtonDown,x,y);
}
- (void) scrollWheel:       (NSEvent *) theEvent {
  NSPoint p = [theEvent locationInWindow]; 
  int button = [theEvent buttonNumber]; 
  CGFloat x = [theEvent deltaX];
  CGFloat y = [theEvent deltaY];
  CGFloat z = [theEvent deltaZ];
  std::cout << "scrollWheel: " << x << "," << y << "," << z << "\n"; 
}
- (void) rotateWithEvent:   (NSEvent *) theEvent DUMP(rotateWithEvent)
- (void) magnifyWithEvent:  (NSEvent *) theEvent DUMP(magnifyWithEvent)
- (void) swipeWithEvent:    (NSEvent *) theEvent DUMP(swipeWithEvent)

// - (void) mouseMoved:        (NSEvent *) theEvent DUMP(mouseMoved)
#if 0
- (void) mouseDown: (NSEvent *) theEvent
{
  int button = [theEvent buttonNumber];
  NSPoint p = [theEvent locationInWindow];
  int x = p.x;
  int y = p.y;
  cout << "mouseDown: button=" << button << " : " << x << "," << y << "\n";
#if 0

  NSPoint p = [theEvent locationInWindow];
 ) {
    case NSLeftMouse: button = gui::GUI_ButtonLeft; break;
    case NSRightMouse: button = gui::GUI_ButtonRight; break;
    case NSOtherMouse:
  int button = gui::GUI_ButtonLeft; // [theEvent buttonNumber];
  // self->mWindowImpl->postButtonPress(button,x,y);
#endif
}

- (void) mouseUp: (NSEvent *) theEvent
{
  DEBUG_LOG(mouseUp)
  int button = [theEvent buttonNumber];
  NSPoint p = [theEvent locationInWindow];
  int x = p.x;
  int y = p.y;
  cout << "mouseUp: button=" << button << " : " << x << "," << y << "\n";
  // int button = gui::GUI_ButtonLeft; 
  // self->mWindowImpl->postButtonRelease(button,x,y);
}

- (void) mouseMoved: (NSEvent *) theEvent
{
  int button = [theEvent buttonNumber];
  NSPoint p = [theEvent locationInWindow];
  int x = p.x;
  int y = p.y;
  cout << "mouseMoved: button=" << button << " : " << x << "," << y << "\n";
  // self->mWindowImpl->postMouseMove(x,y);
}

- (void) mouseDragged: (NSEvent *) theEvent
{
  int button = [theEvent buttonNumber];
  NSPoint p = [theEvent locationInWindow];
  int x = p.x;
  int y = p.y;
  cout << "mouseDragged: button=" << button << " : " << x << "," << y << "\n";
  // self->mWindowImpl->postMouseMove(x,y);
}

- (void) rightMouseDragged: (NSEvent *) theEvent
{
  DEBUG_LOG(rightMouseDragged)
  NSPoint p = [theEvent locationInWindow];
  int x = p.x;
  int y = p.y;
  self->mWindowImpl->postMouseMove(x,y);
}

- (void) rightMouseDown: (NSEvent *) theEvent
{
  NSPoint p = [theEvent locationInWindow];
  int button = gui::GUI_ButtonRight;
  int x = p.x;
  int y = p.y;
  cout << "rightMouseDown: " << x << "," << y << "\n";
  self->mWindowImpl->postButtonPress(button,x,y);
}

- (void) rightMouseUp: (NSEvent *) theEvent
{
  DEBUG_LOG(rightMouseUp)
  NSPoint p = [theEvent locationInWindow];
  int x = p.x;
  int y = p.y;
  int button = gui::GUI_ButtonRight; 
  self->mWindowImpl->postButtonRelease(button,x,y);
}
#endif

#if 0
- (void) rightMouseMoved: (NSEvent *) theEvent
{
  NSPoint p [theEvent locationInWindow];
  int x = p.x;
  int y = p.y;
  int button = gui::GUI_ButtonLeft;
  self->mWindowImpl->postMouseMove(x,y);
}
#endif

/*
- (void) update
{
  self->mWindowImpl->paint(); 
}
*/

#if 0
// set initial OpenGL state (current context is set)
// called after context is created
- (void) prepareOpenGL
{
}

- (BOOL)acceptsFirstResponder
{
  return YES;
}
 
// ---------------------------------
 
- (BOOL)becomeFirstResponder
{
  return  YES;
}

// ---------------------------------
 
- (BOOL)resignFirstResponder
{
  return YES;
}
 
- (void) awakeFromNib
{
    setStartTime (); // get app start time
    getCurrentCaps (); // get current GL capabilites for all displays
    
    // set start values...
    rVel[0] = 0.3; rVel[1] = 0.1; rVel[2] = 0.2; 
    rAccel[0] = 0.003; rAccel[1] = -0.005; rAccel[2] = 0.004;
    fInfo = 1;
    fAnimate = 1;
    time = CFAbsoluteTimeGetCurrent ();  // set animation time start time
    fDrawHelp = 1;
 
    // start animation timer
    timer = [NSTimer timerWithTimeInterval:(1.0f/60.0f) target:self selector:@selector(animationTimer:) userInfo:nil repeats:YES];
    [[NSRunLoop currentRunLoop] addTimer:timer forMode:NSDefaultRunLoopMode];
    [[NSRunLoop currentRunLoop] addTimer:timer forMode:NSEventTrackingRunLoopMode]; // ensure timer fires during resize
}


// this can be a troublesome call to do anything heavyweight, as it is called on window moves, resizes, and display config changes.  So be
// careful of doing too much here.
- (void) update // window resizes, moves and display changes (resize, depth and display config change)
{
msgTime = getElapsedTime ();
[msgStringTex setString:[NSString stringWithFormat:@"update at %0.1f secs", msgTime]  withAttributes:stanStringAttrib];
    [super update];
    if (![self inLiveResize])  {// if not doing live resize
        [self updateInfoString]; // to get change in renderers will rebuld string every time (could test for early out)
        getCurrentCaps (); // this call checks to see if the current config changed in a reasonably lightweight way to prevent expensive re-allocations
    }
}
#endif

@end

#endif

