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
    NSRect rect = NSMakeRect(50.0, 50.0, 200.0, 200.0);
    mRGLCocoaView = [[RGLCocoaView alloc] initWithFrame: rect andWindowImpl: this];
    mNSWindow = [[NSWindow alloc] initWithContentRect: rect styleMask: NSTitledWindowMask|NSClosableWindowMask|NSMiniaturizableWindowMask|NSResizableWindowMask backing:NSBackingStoreBuffered defer:NO];
    [mNSWindow setOpaque:NO];
    // [mNSWindow setDelegate: mRGLCocoaView];
    [mNSWindow setContentView: mRGLCocoaView];
    [mNSWindow setInitialFirstResponder: mRGLCocoaView];
    [mNSWindow makeKeyAndOrderFront: NSApp];
    w->resize(200,200);
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
    window->resize(w,h);
  }
  inline void postButtonPress(int button, int x, int y)   { window->buttonPress(button,x,y); }
  inline void postButtonRelease(int button, int x, int y) { window->buttonRelease(button,x,y); }

private:
  RGLCocoaView *mRGLCocoaView;
  NSWindow     *mNSWindow;
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
  [ [self openGLContext] flushBuffer ];
}

- (void) reshape
{
  DEBUG_LOG(reshape)
  self->mWindowImpl->postReshape();
}

- (void) mouseDown: (NSEvent *) theEvent
{
  NSPoint p = [theEvent locationInWindow];
  int button = gui::GUI_ButtonLeft; // [theEvent buttonNumber];
  int x = p.x;
  int y = p.y;
  self->mWindowImpl->postButtonPress(button,x,y);
}

- (void) mouseUp: (NSEvent *) theEvent
{
  NSPoint p = [theEvent locationInWindow];
  int x = p.x;
  int y = p.y;
  int button = gui::GUI_ButtonLeft; // [theEvent buttonNumber];
  self->mWindowImpl->postButtonRelease(button,x,y);
}

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

