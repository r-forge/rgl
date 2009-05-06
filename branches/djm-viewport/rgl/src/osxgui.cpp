#include "config.hpp"
// ---------------------------------------------------------------------------
#ifdef RGL_CARBON
/**
 * TODO
- get font width
 **/
// ---------------------------------------------------------------------------
#include "osxgui.hpp"
#include "lib.hpp"
// ---------------------------------------------------------------------------
#include <Carbon/Carbon.h>
#include <AGL/agl.h>
#include "opengl.hpp"
#include "assert.hpp"
#include "R.h"
#include <Rinternals.h>
// ---------------------------------------------------------------------------
// configuration
// ---------------------------------------------------------------------------
#define EMULATE_RIGHT_KEYMOD  controlKey
#define EMULATE_MIDDLE_KEYMOD optionKey
// ---------------------------------------------------------------------------
namespace gui {
// ---------------------------------------------------------------------------
class OSXWindowImpl : public WindowImpl
{
public:
  OSXWindowImpl(Window* window);
  ~OSXWindowImpl();
  void setTitle(const char* title);
  void setWindowRect(int left, int top, int right, int bottom);
  void getWindowRect(int *left, int *top, int *right, int *bottom);
  void show();
  void hide() { }
  void update();
  void bringToTop(int stay);
  void destroy();
  bool beginGL();
  void endGL();
  void swap();
  void captureMouse(View* captureView) { }
  void releaseMouse(void) { }
  GLFont* getFont(const char* family, int style, double cex, 
                  bool useFreeType);
  
private:
  void on_init();
  void on_dispose();
  void on_paint();
  void init_gl();
  GLBitmapFont* initGLFont();
  void dispose_gl();
  OSStatus windowHandler(EventHandlerCallRef next, EventRef e);
  static OSStatus memberDelegate(EventHandlerCallRef next, EventRef e,void* userdata);
  ::WindowRef mWindowRef;
  Rect mRect;
  ::AGLContext mGLContext;
  UInt32 mMouseDownMod;
  UInt32 mButtonDown;
};
// ---------------------------------------------------------------------------
OSXWindowImpl::OSXWindowImpl(Window* window)
  : WindowImpl(window)
{
  OSStatus s;
  WindowClass wc = kDocumentWindowClass;
  WindowAttributes wa = 0
    // |kWindowCompositingAttribute
    |kWindowStandardDocumentAttributes
    |kWindowStandardHandlerAttribute
    |kWindowLiveResizeAttribute
  ;
  mRect.left = 100;
  mRect.right = mRect.left + 256;
  mRect.top = 100;
  mRect.bottom = mRect.top + 256;
  s = CreateNewWindow(wc,wa,&mRect,&mWindowRef);
  check_noerr(s); 
  EventTypeSpec typeList[] = {
    { kEventClassWindow,    kEventWindowClosed },
    { kEventClassWindow,    kEventWindowDrawContent },
    { kEventClassWindow,    kEventWindowBoundsChanged },
    { kEventClassKeyboard,  kEventRawKeyDown },
    { kEventClassKeyboard,  kEventRawKeyUp },
    { kEventClassMouse,     kEventMouseDown },
    { kEventClassMouse,     kEventMouseUp },
    { kEventClassMouse,     kEventMouseMoved },
    { kEventClassMouse,     kEventMouseDragged },
    { kEventClassMouse,     kEventMouseWheelMoved }
  };
  int numTypes = sizeof(typeList)/sizeof(EventTypeSpec);
  EventHandlerUPP handlerUPP = NewEventHandlerUPP(OSXWindowImpl::memberDelegate);
  EventTargetRef theTarget; 
  theTarget = GetWindowEventTarget(mWindowRef);
  InstallEventHandler(
    theTarget, handlerUPP,
    numTypes, typeList,
    this, 
    NULL
  );  	
  on_init();	
}
// ---------------------------------------------------------------------------
OSXWindowImpl::~OSXWindowImpl()
{
}
void OSXWindowImpl::setTitle(const char* text)
{
  CFStringRef s = CFStringCreateWithCString(
    kCFAllocatorDefault
  , text
  , kCFStringEncodingASCII
  );
  SetWindowTitleWithCFString( mWindowRef, s );
}
void OSXWindowImpl::setWindowRect(int left, int top, int right, int bottom)
{
  mRect.left = left;
  mRect.top = top;
  mRect.right = right;
  mRect.bottom = bottom;
  MoveWindow(mWindowRef, left, top, false);
  SizeWindow(mWindowRef, right-left, bottom-top, true);
}
// ---------------------------------------------------------------------------
void OSXWindowImpl::getWindowRect(int *left, int *top, int *right, int *bottom)
{
  Rect rect;
  GetWindowBounds(mWindowRef, kWindowContentRgn, &rect);
  *left = rect.left;
  *top = rect.top;
  *right = rect.right;
  *bottom = rect.bottom;
}
// ---------------------------------------------------------------------------
void OSXWindowImpl::destroy()
{
  DisposeWindow(mWindowRef);
}
// ---------------------------------------------------------------------------
void OSXWindowImpl::on_init()
{
  init_gl();
  fonts[0] = initGLFont();
  aglUpdateContext(mGLContext);
}
// ---------------------------------------------------------------------------
void OSXWindowImpl::on_dispose()
{
  dispose_gl();
  if (window)
    window->notifyDestroy();
  delete this;
}
// ---------------------------------------------------------------------------
GLFont* OSXWindowImpl::getFont(const char* family, int style, double cex, 
                                 bool useFreeType)
{
  for (unsigned int i=0; i < fonts.size(); i++) {
    if (fonts[i]->cex == cex && fonts[i]->style == style && !strcmp(fonts[i]->family, family)
     && fonts[i]->useFreeType == useFreeType)
      return fonts[i];
  }
  
  if (useFreeType) {
#ifdef HAVE_FREETYPE
    int len=0;
    SEXP Rfontname = VECTOR_ELT(PROTECT(eval(lang2(install("rglFonts"), 
                                          ScalarString(mkChar(family))), R_GlobalEnv)),
                                          0);
    if (isString(Rfontname) && length(Rfontname) >= style) {
      const char* fontname = CHAR(STRING_ELT(Rfontname, style-1)); 
      GLFTFont* font=new GLFTFont(family, style, cex, fontname);
      if (font->font) {
        fonts.push_back(font);
        UNPROTECT(1);
        return font;
      } else {
        warning(font->errmsg);
        delete font;
      }
    }
    UNPROTECT(1);
#endif
  }
  return fonts[0];  
}
// ---------------------------------------------------------------------------

GLBitmapFont* OSXWindowImpl::initGLFont()
{
  GLBitmapFont* font = new GLBitmapFont("bitmap", 1, 1, "fixed");  
  GLuint first = GL_BITMAP_FONT_FIRST_GLYPH;
  GLuint last = GL_BITMAP_FONT_LAST_GLYPH;
  GLuint count = last-first+1;
  GLuint listBase = glGenLists(count);
  GLboolean success = aglUseFont(
    mGLContext,
    0,  // system font
    normal,
    12, // GLsizei
    first,
    count, 
    listBase
  );
  assert(success == GL_TRUE);
  font->firstGlyph = first;
  font->listBase = listBase - first;
  font->widths = new unsigned int[count];
  for (int i=0;i<count;++i)
    font->widths[i] = 8;
  font->ascent = 10;  // Pure guess
  return font;
}
// ---------------------------------------------------------------------------
void OSXWindowImpl::init_gl()
{
  GLint attributes[] = {
    AGL_RGBA,
    AGL_DOUBLEBUFFER,
    AGL_LEVEL, 1,
    AGL_WINDOW, GL_TRUE,
    AGL_DEPTH_SIZE, 1,
    AGL_NONE
  };
  AGLPixelFormat pf = aglChoosePixelFormat(NULL,0,attributes);
  assert(pf);
  mGLContext = aglCreateContext( pf, NULL );
  assert(mGLContext);
  GLboolean b = aglSetDrawable( mGLContext, GetWindowPort(mWindowRef) );
  assert(b);
  aglSetCurrentContext(mGLContext);
}
// ---------------------------------------------------------------------------
void OSXWindowImpl::dispose_gl()
{
  aglSetCurrentContext(0);
  aglDestroyContext(mGLContext);
}
// ---------------------------------------------------------------------------
void OSXWindowImpl::swap()
{
  aglSwapBuffers(mGLContext);
}
// ---------------------------------------------------------------------------
bool OSXWindowImpl::beginGL()
{
  if (aglSetCurrentContext(mGLContext) == GL_TRUE) return true;
  else return false;
}
// ---------------------------------------------------------------------------
void OSXWindowImpl::endGL()
{
}
// ---------------------------------------------------------------------------
void OSXWindowImpl::update()
{
  InvalWindowRect(mWindowRef, &mRect);
  SAVEGLERROR;
  on_paint();
  SAVEGLERROR;
}
// ---------------------------------------------------------------------------
void OSXWindowImpl::show()
{
  ShowWindow(mWindowRef);
  GetWindowBounds(mWindowRef,kWindowContentRgn,&mRect);
  if (window) 
    window->resize( mRect.right - mRect.left, mRect.bottom - mRect.top );
}
// ---------------------------------------------------------------------------
void OSXWindowImpl::bringToTop(int stay)
{
  BringToFront( mWindowRef );
  /* stay will be ignored for now, as making a window floating,
     requires to recreate a new window using a different window class
     on carbon.
  */
}
// ---------------------------------------------------------------------------
void OSXWindowImpl::on_paint()
{
  if (window)
  {
    if (window->skipRedraw) return;
    window->paint();
  }  
  swap();
}
// ---------------------------------------------------------------------------
OSStatus OSXWindowImpl::windowHandler(EventHandlerCallRef next, EventRef e) {
  EventClass clazz = GetEventClass(e);
  EventKind kind = GetEventKind(e);
  switch( clazz ) {
    case kEventClassWindow:
      {
        switch( kind ) {
          case kEventWindowDrawContent:
            on_paint();
            break;
          case kEventWindowClosed:
            on_dispose();
            break;
          case kEventWindowBoundsChanged:
            {
              aglUpdateContext(mGLContext);
              GetWindowBounds(mWindowRef,kWindowContentRgn,&mRect);
              if (window) {
                window->resize( mRect.right - mRect.left, mRect.bottom - mRect.top );
                update();
		      }
            }
            break; 
        }
      }
      break;
    case kEventClassMouse:
      {
        EventMouseButton button;
        GetEventParameter(e,kEventParamMouseButton,   typeMouseButton, NULL, sizeof(button), NULL, &button);
        Point location;
        GetEventParameter(e,kEventParamMouseLocation, typeQDPoint, NULL, sizeof(Point), NULL, &location);
        int mouseX = location.h - mRect.left;
        int mouseY = location.v - mRect.top;
        switch( kind ) {
          case kEventMouseDown:
            {
          
              UInt32 mod = GetCurrentKeyModifiers();
              if (mod & EMULATE_RIGHT_KEYMOD) {
                mButtonDown = GUI_ButtonRight;
                mMouseDownMod = EMULATE_RIGHT_KEYMOD;
              } else if (mod & EMULATE_MIDDLE_KEYMOD) {
                mButtonDown = GUI_ButtonMiddle;
                mMouseDownMod = EMULATE_MIDDLE_KEYMOD;
              } else {
                mButtonDown = button;
                mMouseDownMod = 0;
              }
              window->buttonPress( mButtonDown,mouseX,mouseY);
            }
            break;
          case kEventMouseUp:
            if ( (mButtonDown) && ( (mMouseDownMod) || (mButtonDown == button) ) ) {
              window->buttonRelease( mButtonDown,mouseX,mouseY);
              mMouseDownMod = 0;
              mButtonDown   = 0;
            }
            break;
          case kEventMouseMoved:
          case kEventMouseDragged:
            window->mouseMove(mouseX,mouseY);
            break;
          case kEventMouseWheelMoved:
            UInt16 axis;
            GetEventParameter(e,kEventParamMouseWheelAxis, typeMouseWheelAxis, NULL, sizeof(axis), NULL, &axis);
            if (axis == kEventMouseWheelAxisY) {
              int delta;
              GetEventParameter(e,kEventParamMouseWheelDelta, typeSInt32, NULL, sizeof(delta), NULL, &delta);
              if (delta != 0)
                window->wheelRotate( (delta > 0) ? GUI_WheelForward : GUI_WheelBackward );
            }
        }
      }
      break;
    case kEventClassKeyboard:
      {
        UInt32 keycode;
        GetEventParameter(e,kEventParamKeyCode, typeUInt32, NULL, sizeof(keycode), NULL, &keycode);
        switch( kind ) {
          case kEventRawKeyDown:
            break;
          case kEventRawKeyUp:
            break;
          case kEventRawKeyModifiersChanged:
            
            break;
          default:
            break;
        }
      }
      break;
    default:
      break;
  }   
  return CallNextEventHandler(next,e);
}
// ---------------------------------------------------------------------------
OSStatus OSXWindowImpl::memberDelegate(EventHandlerCallRef next, EventRef e, void* userdata)
{
  return static_cast<OSXWindowImpl*>(userdata)->windowHandler(next,e);
}
// ---------------------------------------------------------------------------
// GUI Factory
// ---------------------------------------------------------------------------
OSXGUIFactory::OSXGUIFactory()
{
}
// ---------------------------------------------------------------------------
OSXGUIFactory::~OSXGUIFactory()
{
}
// ---------------------------------------------------------------------------
WindowImpl* OSXGUIFactory::createWindowImpl(Window* window)
{
  return new OSXWindowImpl(window);
}
// ---------------------------------------------------------------------------
extern int gInitValue;
bool OSXGUIFactory::hasEventLoop()
{
  return gInitValue != 0;
}
// ---------------------------------------------------------------------------
} // namespace gui
// ---------------------------------------------------------------------------
#endif // RGL_CARBON

